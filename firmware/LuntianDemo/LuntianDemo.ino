#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <time.h>
#include "secrets.h"

const char* DEVICE_ID = "luntian-demo-esp32-01";
const int RELAY_TEMP_PIN = 26;
const int RELAY_WATER_PIN = 27;
const bool RELAY_ACTIVE_LOW = true;

const int DHT_PIN = 4;
const int TRIG_PIN = 32;
const int ECHO_PIN = 33;
const float AUTO_THRESHOLD_TEMP_C = 36.0;
const float FULL_LEVEL_DISTANCE_CM = 10.0;
const float TANK_DEPTH_CM = 100.0;
const unsigned long SENSOR_INTERVAL_MS = 2000;
const unsigned long TELEMETRY_INTERVAL_MS = 5000;
const unsigned long COMMAND_INTERVAL_MS = 2000;
const unsigned long WIFI_RETRY_INTERVAL_MS = 10000;

DHT dht(DHT_PIN, DHT22);
WiFiClientSecure tlsClient;
bool tempRelayOn = false;
bool waterRelayOn = false;
bool tempLocked = true;
bool waterLocked = true;
bool dhtSensorFault = true;
bool waterSensorFault = true;
bool networkTimeSynced = false;
float lastTemp = NAN;
float lastHumidity = NAN;
float lastDistanceCm = NAN;
unsigned long lastSensorAt = 0;
unsigned long lastTelemetryAt = 0;
unsigned long lastCommandAt = 0;
unsigned long lastWifiRetryAt = 0;

String functionUrl(const String& route) {
  return String(SUPABASE_FUNCTION_URL) + "/" + route;
}

void applyTempRelay() {
  const bool level = RELAY_ACTIVE_LOW ? !tempRelayOn : tempRelayOn;
  digitalWrite(RELAY_TEMP_PIN, level ? HIGH : LOW);
}

void applyWaterRelay() {
  const bool level = RELAY_ACTIVE_LOW ? !waterRelayOn : waterRelayOn;
  digitalWrite(RELAY_WATER_PIN, level ? HIGH : LOW);
}

float readWaterDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  const unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return NAN;
  return duration * 0.0343f / 2.0f;
}

void applySafetyRules() {
  tempLocked = dhtSensorFault || isnan(lastTemp) || lastTemp >= AUTO_THRESHOLD_TEMP_C;
  if (tempLocked && tempRelayOn) {
    tempRelayOn = false;
    applyTempRelay();
    Serial.println("Safety cutoff: temperature outlet OFF");
  }

  waterLocked = waterSensorFault || isnan(lastDistanceCm) || lastDistanceCm <= FULL_LEVEL_DISTANCE_CM;
  if (waterLocked && waterRelayOn) {
    waterRelayOn = false;
    applyWaterRelay();
    Serial.println("Safety cutoff: water inlet OFF");
  }
}

void updateSensors() {
  if (millis() - lastSensorAt < SENSOR_INTERVAL_MS) return;
  lastSensorAt = millis();

  const float humidity = dht.readHumidity();
  const float temperature = dht.readTemperature();
  dhtSensorFault = isnan(humidity) || isnan(temperature);
  if (!dhtSensorFault) {
    lastHumidity = humidity;
    lastTemp = temperature;
  } else {
    Serial.println("DHT22 read failed; temperature relay is locked off");
  }

  const float distance = readWaterDistanceCm();
  waterSensorFault = isnan(distance);
  if (!waterSensorFault) lastDistanceCm = distance;
  else Serial.println("HC-SR04 read failed; water inlet is locked off");

  applySafetyRules();
}

int postJson(const String& route, const String& body, String* responseBody = nullptr) {
  if (WiFi.status() != WL_CONNECTED) return -1;
  HTTPClient http;
  if (!http.begin(tlsClient, functionUrl(route))) return -1;
  http.setTimeout(5000);
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("x-device-token", DEVICE_TOKEN);
  http.addHeader("Content-Type", "application/json");
  const int status = http.POST(body);
  const String response = http.getString();
  if (responseBody) *responseBody = response;
  if (status >= 400) Serial.printf("HTTP response: %s\n", response.c_str());
  http.end();
  return status;
}

int getJson(const String& route, String& responseBody) {
  if (WiFi.status() != WL_CONNECTED) return -1;
  HTTPClient http;
  if (!http.begin(tlsClient, functionUrl(route))) return -1;
  http.setTimeout(5000);
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("x-device-token", DEVICE_TOKEN);
  const int status = http.GET();
  responseBody = http.getString();
  if (status >= 400) Serial.printf("HTTP response: %s\n", responseBody.c_str());
  http.end();
  return status;
}

String jsonNumber(float value, int decimals = 1) {
  return isnan(value) ? "null" : String(value, decimals);
}

float waterLevelPercent() {
  if (waterSensorFault || TANK_DEPTH_CM <= 0) return NAN;
  return constrain((TANK_DEPTH_CM - lastDistanceCm) * 100.0f / TANK_DEPTH_CM, 0.0f, 100.0f);
}

void sendTelemetry() {
  if (millis() - lastTelemetryAt < TELEMETRY_INTERVAL_MS) return;
  lastTelemetryAt = millis();

  String body = "{";
  body += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  body += "\"temperature_c\":" + jsonNumber(lastTemp) + ",";
  body += "\"humidity_pct\":" + jsonNumber(lastHumidity) + ",";
  body += "\"water_distance_cm\":" + jsonNumber(lastDistanceCm) + ",";
  body += "\"water_level_pct\":" + jsonNumber(waterLevelPercent()) + ",";
  body += "\"temp_relay_on\":" + String(tempRelayOn ? "true" : "false") + ",";
  body += "\"water_relay_on\":" + String(waterRelayOn ? "true" : "false") + ",";
  body += "\"temp_overheat\":" + String(tempLocked && !dhtSensorFault ? "true" : "false") + ",";
  body += "\"water_full\":" + String(waterLocked && !waterSensorFault ? "true" : "false") + ",";
  body += "\"dht_sensor_fault\":" + String(dhtSensorFault ? "true" : "false") + ",";
  body += "\"water_sensor_fault\":" + String(waterSensorFault ? "true" : "false");
  body += "}";
  Serial.printf("Telemetry HTTP status: %d\n", postJson("telemetry", body));
}

bool executeCommand(const String& action, String& result) {
  if (action == "temp_off") {
    tempRelayOn = false;
    applyTempRelay();
    result = "temperature outlet turned off";
    return true;
  }
  if (action == "water_off") {
    waterRelayOn = false;
    applyWaterRelay();
    result = "water inlet turned off";
    return true;
  }

  applySafetyRules();
  if (action == "temp_on" && !tempLocked) {
    tempRelayOn = true;
    applyTempRelay();
    result = "temperature outlet turned on";
    return true;
  }
  if (action == "water_on" && !waterLocked) {
    waterRelayOn = true;
    applyWaterRelay();
    result = "water inlet turned on";
    return true;
  }
  result = tempLocked && action == "temp_on" ? "blocked by temperature sensor safety" : "blocked by tank sensor safety or unknown command";
  return false;
}

void pollCommands() {
  if (millis() - lastCommandAt < COMMAND_INTERVAL_MS) return;
  lastCommandAt = millis();
  String body;
  const int status = getJson(String("command?device_id=") + DEVICE_ID, body);
  if (status != 200) {
    if (status > 0) Serial.printf("Command poll HTTP status: %d\n", status);
    return;
  }

  StaticJsonDocument<384> document;
  if (deserializeJson(document, body)) return;
  const char* id = document["id"];
  const char* action = document["action"];
  if (!id || !action) return;

  String result;
  const bool completed = executeCommand(action, result);
  String ack = "{\"device_id\":\"" + String(DEVICE_ID) + "\",\"command_id\":\"" + String(id);
  ack += "\",\"status\":\"" + String(completed ? "completed" : "rejected");
  ack += "\",\"result\":\"" + result + "\"}";
  Serial.printf("Command %s: %s (HTTP %d)\n", action, result.c_str(), postJson("ack", ack));
}

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  const unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - startedAt >= 20000) {
      Serial.println();
      Serial.printf("Wi-Fi connection timed out (status %d). Check SSID/password and use 2.4 GHz Wi-Fi.\n", static_cast<int>(WiFi.status()));
      lastWifiRetryAt = millis();
      return;
    }
    delay(500);
    Serial.print('.');
  }
  Serial.println();
  Serial.print("Connected; IP address: ");
  Serial.println(WiFi.localIP());
}

void syncClock() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  struct tm timeInfo;
  const unsigned long startedAt = millis();
  while (!getLocalTime(&timeInfo, 1000) && millis() - startedAt < 15000) {
    Serial.println("Waiting for network time before TLS verification");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_TEMP_PIN, OUTPUT);
  pinMode(RELAY_WATER_PIN, OUTPUT);
  tempRelayOn = false;
  waterRelayOn = false;
  applyTempRelay();
  applyWaterRelay();
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);
  dht.begin();

  tlsClient.setCACert(SUPABASE_ROOT_CA);
  connectWifi();
  lastSensorAt = millis() - SENSOR_INTERVAL_MS;
}

void loop() {
  updateSensors();
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastWifiRetryAt >= WIFI_RETRY_INTERVAL_MS) {
      lastWifiRetryAt = millis();
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      Serial.println("Retrying Wi-Fi connection");
    }
    return;
  }
  if (!networkTimeSynced) {
    syncClock();
    struct tm timeInfo;
    networkTimeSynced = getLocalTime(&timeInfo, 1000);
    if (!networkTimeSynced) Serial.println("Network time not available yet; TLS requests may fail until time sync succeeds");
  }
  sendTelemetry();
  pollCommands();
}