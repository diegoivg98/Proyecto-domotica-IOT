// Librerías necesarias para el servidor y la conexión WIFI
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <EEPROM.h> // Incluir la librería de la EEPROM
#include <EMailSender.h> // Incluir la librería para enviar e-mail
#include <ArduinoJson.h> // Incluir la librería para manejar JSON


#ifndef STASSID
#define STASSID "A7RED" // Nombre de red WIFI
#define STAPSK  "" // Contraseña WIFI
#endif
       
const char *ssid = STASSID; 
const char *password = STAPSK; 

ESP8266WebServer server(80); // Puerto del servidor

EMailSender emailSend("servidormemoria@gmail.com", "servidor1234"); // Constructor para enviar el mail

// Variables
const int led = D0;
int iluminacionStatus = 0;
int seguridadStatus = 0;
int interruptorStatus = 0;
int camaraStatus = 0;
int aguaStatus = 0;
int luzStatus = 0;
int movimientoStatus = 0;
String json = ""; // variable en blanco para almacenar texto JSON
struct Credenciales { // Estructura para las credenciales de login

  String usuario;

  String clave;

};

String dataseg = ""; // String para generar acciones en seguridad
String datath = ""; // String para guardar valor de temperatura y humedad
String datapines = ""; // String para guardar la información de los pines del arduino
String datalarma = ""; // String para guardar la información de la situacion de la alarma en el arduino
String inputString = ""; // String de entrada 
String solIP = ""; // String de solicitud de IP 
String dirIP = ""; // String con la IP
bool stringRecibido = false; // Comprobar que entró un mensaje serial


// Página de muestra de funcionamiento del servidor
void root() {
  digitalWrite(led, LOW);
  char temp[400];
  int sec = millis() / 1000;
  int min = sec / 60;
  int hr = min / 60;

  snprintf(temp, 400,

           "<html>\
  <head>\   
    <title>Servidor Memoria</title>\
    <style>\
      body { font-family: Arial, Helvetica, Sans-Serif; Color: #000088; }\
    </style>\
  </head>\
  <body>\
    <h1>Servidor Corriendo</h1>\
    <p>Tiempo Arriba: %02d:%02d:%02d</p>\    
  </body>\
</html>",

           hr, min % 60, sec % 60
          );
  server.send(200, "text/html", temp);
  digitalWrite(led, HIGH);
}


// Sección login
void login() {
  
  EEPROM.begin(512); // inicializa la EEPROM
  
  int eeAddress = 0; // Se define el espacio de memoria a leer
  Credenciales mycustom; // El nombre para nueva estructura
  EEPROM.get(eeAddress, mycustom); // Lee la EEPROM en el valor eeAdress y lo almacena en el la estructura creada previamente
  
  Serial.println(mycustom.usuario); // Envía por serial el nombre (prueba)
  Serial.println(mycustom.clave); // Envía por serial el password (prueba)

  json = "{\"usuario\":\"" + mycustom.usuario + "\", \"clave\":\"" + mycustom.clave + "\"}"; // Mensaje JSON a envíar al cliente con las credenciales
  
  server.send(200, "application/json", json); // Enviar credenciales
  
  EEPROM.end(); // Finalizar la lectura de EEPROM

}


// Modificar los datos de usuario y clave que estan en la EEPROM
void grabarlogin() {   
  
  if (server.hasArg("plain")== false){ // revisa si hay cuerpo en el mensaje (Body)
 
    server.send(200, "text/plain", "Ok pero Body no recibido"); // si no hay Body responde
    return;
 
  } 

  // El Body es JSON 
  String json = server.arg("plain");
  StaticJsonDocument<150> doc;
  DeserializationError error = deserializeJson(doc, json); // Deserealiza el JSON para tomar variables

  if (error) { // Por si hay un error deserializando el JSON
    Serial.print(F("deserializeJson() error: "));
    Serial.println(error.f_str());
    server.send(400, "text/plain", "Error: Petición MALA"); // Responde al cliente
    return;
  }

  String user = doc["usuario"];
  String pass = doc["clave"];
      
  EEPROM.begin(512); // Inicializa la EEPROM

  int eeAddress = 0;
  Credenciales customVar = {

    user,
    pass 

  };

  EEPROM.put(eeAddress, customVar); // Guarda en la EEPROM
  EEPROM.commit(); // Hace commit para guardar los cambios
  EEPROM.end(); // Finaliza la EEPROM
  
  server.send(200, "text/html", "Nuevos datos grabados"); // Envía respuesta el cliente

}



// Sección dashboard
void dashboard() {

  String jsonth = datath;
  StaticJsonDocument<150> docht;
  DeserializationError error = deserializeJson(docht, jsonth);

  if (error) { //Por si hay un error deserializando el JSON
    Serial.print(F("deserializeJson() error: "));
    Serial.println(error.f_str());    
    return;
  }

  String temperatura = docht["temperatura"];
  String humedad = docht["humedad"];
      
  
  EEPROM.begin(512); // Inicializa la EEPROM
  
  DynamicJsonDocument doc(200); // Crear documento JSON 
  doc["ilu"] = String(EEPROM.read(24));
  doc["cam"] = String(EEPROM.read(29));
  doc["seg"] = String(EEPROM.read(34));
  doc["inte"] = String(EEPROM.read(39));
  doc["agu"] = String(EEPROM.read(44));
  doc["tem"] = temperatura;
  doc["luz"] = String(EEPROM.read(54));
  doc["mov"] = String(EEPROM.read(59));  
  doc["hum"] = humedad;
  doc["puerta1"] = String(datalarma);

  String json;
  serializeJson(doc, json);
  
  server.send(200, "application/json", json); // Envíar el documento JSON como respuesta el cliente 
  
  EEPROM.end(); // Finaliza la EEPROM
}


// Sección iluminación
void iluminacion() {
  EEPROM.begin(512); //Inicializa la EEPROM
  iluminacionStatus = datapines[0]; // Obtener si esta activo o no el sensor 1
  DynamicJsonDocument doc(200); // Crea un documento JSON a armar
  doc["ilu"] = String(EEPROM.read(24)); // Primera variable del JSON (suiche de act o desact)
  doc["ilu1"] = String((char)iluminacionStatus); // Segunda Variable del JSON (suiche 1)

  String json; // Un string para armar el JSON
  serializeJson(doc, json); // Arma el JSON en la Variable "json"
  server.send(200, "application/json", json); // Envía como respuesta el JSON al cliente  
  EEPROM.end(); // Finaliza la EEPROM
}
void iluact() {
  EEPROM.begin(512); // Inicializa la EEPROM
  EEPROM.put(24, 1); // Graba en la EEPROM un 1 en la posición 24
  EEPROM.commit(); // Hace commit para guardar los cambios 
  server.send(200, "text/html", "Activado"); // Responde al cliente
  //Serial.print("iluon/"); 
  EEPROM.end(); // Finaliza la EEPROM
}
void iludes() { 
  EEPROM.begin(512); // Inicializa la EEPROM
  EEPROM.put(24, 0); // Graba en la EEPROM un 0 en la posición 24
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Desactivado"); // Responde al cliente
  //Serial.print("iluoff/");  
  EEPROM.end(); // Finaliza la EEPROM
}
void ilu1on() {
  server.send(200, "text/html", "Encendido"); // Responde al cliente
  Serial.print("ilu1on/"); // Envía por serial al Arduino
  digitalWrite(led, LOW);
}
void ilu1off() {  
  server.send(200, "text/html", "Apagado"); // Responde al cliente
  Serial.print("ilu1off/"); // Envía por serial al Arduino
  digitalWrite(led, HIGH);
}




// Sección Cámaras
void camara() {
  EEPROM.begin(512);
  camaraStatus = EEPROM.read(70);
  DynamicJsonDocument doc(200);
  doc["cam"] = String(EEPROM.read(29));
  doc["cam1"] = String(camaraStatus);

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);  
  EEPROM.end();
}
void camact() {
  EEPROM.begin(512);
  EEPROM.put(29, 1);
  EEPROM.commit(); // Hace commit para guardar los cambios 
  server.send(200, "text/html", "Activado");
  //Serial.print("camon/");  
  EEPROM.end();
}
void camdes() { 
  EEPROM.begin(512);
  EEPROM.put(29, 0);
  EEPROM.commit(); // Hace commit para guardar los cambios 
  server.send(200, "text/html", "Desactivado");
  //Serial.print("camoff/");
  EEPROM.end();
}
void cam1on() {
  EEPROM.begin(512);
  EEPROM.put(70, 1);  
  Serial.print("cam1on/");
  digitalWrite(led, LOW);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Encendido");
  EEPROM.end();
}
void cam1off() {  
  EEPROM.begin(512);
  EEPROM.put(70, 0); 
  Serial.print("cam1off/");
  digitalWrite(led, HIGH);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Apagado");
  EEPROM.end();
}


//Sección Seguridad
void seguridad() {
  EEPROM.begin(512);
  seguridadStatus = datapines[5]; 
  DynamicJsonDocument doc(200);
  doc["seg"] = String(EEPROM.read(34));
  doc["seg1"] = String((char)seguridadStatus);
  doc["puerta1"] = String(datalarma);

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);  
  EEPROM.end();
}
void segact() {
  EEPROM.begin(512);
  EEPROM.put(34, 1);
  EEPROM.commit(); // Hace commit para guardar los cambios 
  server.send(200, "text/html", "Activado");
  //Serial.print("segon/");  
  EEPROM.end();
}
void segdes() { 
  EEPROM.begin(512);
  EEPROM.put(34, 0);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Desactivado");
  //Serial.print("segoff/");  
  EEPROM.end();
}
void seg1on() {
  server.send(200, "text/html", "Encendido");
  Serial.print("seg1on/");
  digitalWrite(led, LOW);
}
void seg1off() {  
  server.send(200, "text/html", "Apagado");
  Serial.print("seg1off/");
  digitalWrite(led, HIGH);
}



//Sección Interruptores
void interruptor() {
  EEPROM.begin(512);
  interruptorStatus = datapines[1];
  DynamicJsonDocument doc(200);
  doc["inte"] = String(EEPROM.read(39));
  doc["inte1"] = String((char)interruptorStatus);

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);  
  EEPROM.end();
}
void inteact() {
  EEPROM.begin(512);
  EEPROM.put(39, 1);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Activado");
  //Serial.print("inteon/");  
  EEPROM.end();
}
void intedes() { 
  EEPROM.begin(512);
  EEPROM.put(39, 0);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Desactivado");
  //Serial.print("inteoff/");  
  EEPROM.end();
}
void inte1on() {
  server.send(200, "text/html", "Encendido");
  Serial.print("inte1on/");
  digitalWrite(led, LOW);
}
void inte1off() {  
  server.send(200, "text/html", "Apagado");
  Serial.print("inte1off/");
  digitalWrite(led, HIGH);
}



//Sección agua
void agua() {
  EEPROM.begin(512);
  aguaStatus = datapines[2];
  DynamicJsonDocument doc(200);
  doc["agu"] = String(EEPROM.read(44));
  doc["agu1"] = String((char)aguaStatus);

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);  
  EEPROM.end();
}
void aguact() {
  EEPROM.begin(512);
  EEPROM.put(44, 1);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Activado");
  //Serial.print("aguon/");   
  EEPROM.end();
}
void agudes() { 
  EEPROM.begin(512);
  EEPROM.put(44, 0);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Desactivado");
  //Serial.print("aguoff/");  
  EEPROM.end();
}
void agu1on() {
  server.send(200, "text/html", "Encendido");
  Serial.print("agu1on/");
  digitalWrite(led, LOW);
}
void agu1off() {  
  server.send(200, "text/html", "Apagado");
  Serial.print("agu1off/");
  digitalWrite(led, HIGH);
}


//Sección Luz automática
void luz() {
  EEPROM.begin(512);
  luzStatus = datapines[4];
  DynamicJsonDocument doc(200);
  doc["luz"] = String(EEPROM.read(54));
  doc["luz1"] = String((char)luzStatus);

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);  
  EEPROM.end();
}
void luzact() {
  EEPROM.begin(512);
  EEPROM.put(54, 1);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Activado");
  //Serial.print("luzon/");   
  EEPROM.end();
}
void luzdes() { 
  EEPROM.begin(512);
  EEPROM.put(54, 0);
  server.send(200, "text/html", "Desactivado");
  EEPROM.commit(); // Hace commit para guardar los cambios
  //Serial.print("luzoff/");  
  EEPROM.end();
}
void luz1on() {
  server.send(200, "text/html", "Encendido");
  Serial.print("luz1on/");
  digitalWrite(led, LOW);
}
void luz1off() {  
  server.send(200, "text/html", "Apagado");
  Serial.print("luz1off/");
  digitalWrite(led, HIGH);
}


//Sección Movimiento
void movimiento() {
  EEPROM.begin(512);
  movimientoStatus = datapines[3];
  DynamicJsonDocument doc(200);
  doc["mov"] = String(EEPROM.read(59));
  doc["mov1"] = String((char)movimientoStatus);

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);  
  EEPROM.end();
}
void movact() {
  EEPROM.begin(512);
  EEPROM.put(59, 1);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Activado");
  //Serial.print("movon/");   
  EEPROM.end();
}
void movdes() { 
  EEPROM.begin(512);
  EEPROM.put(59, 0);
  EEPROM.commit(); // Hace commit para guardar los cambios
  server.send(200, "text/html", "Desactivado");
  //Serial.print(movoff/");  
  EEPROM.end();
}
void mov1on() {
  server.send(200, "text/html", "Encendido");
  Serial.print("mov1on/");
  digitalWrite(led, LOW);
}
void mov1off() {  
  server.send(200, "text/html", "Apagado");
  Serial.print("mov1off/");
  digitalWrite(led, HIGH);
}


//Enviar mail de alerta
void alertaMail() {   
  
   EMailSender::EMailMessage message;
    message.subject = "Alerta de seguridad!";
    message.message = "La seguridad de su hogar ha sido activada.<br>por favor ingrese:<br>http://localhost:3000/seguridad";

    EMailSender::Response resp = emailSend.send("gabriel.palocz@alu.ucm.cl", message);

    Serial.println("Estado de envío: ");

    Serial.println(resp.status);
    Serial.println(resp.code);
    Serial.println(resp.desc);
  
}

// Solicitar al Arduino los datos del sensor DHT
void dhtsolicitar(){
   Serial.print("dht/");  
}

// Solicitar al Arduino el estado de los pines
void pinesolicitar(){
   Serial.print("pines/");  
}

// Solicitar al Arduino el estado de los pines
void alarmasolicitar(){
   Serial.print("alarma/");  
}


void desalarm(){ 
  Serial.print("desalarm/");
  server.send(200, "text/html", "Desactivado");      
}


//URL no encontrada (Error 404)
void notFound() {
  
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";

  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }

  server.send(404, "text/plain", message);
 
}



void setup(void) {
    
  pinMode(led, OUTPUT);
  digitalWrite(led, HIGH);
  Serial.begin(9600); 
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

  
// Esperar hasta que conecte
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.print("Conectado a ");
  Serial.println(ssid);
  Serial.print("Servidor en http:// ");
  Serial.println(WiFi.localIP());
  
  // Respondedor MDNS para no ingresar la IP en el cliente
  if (MDNS.begin("servidormemoria")) {
    Serial.println("Respondedor MDNS iniciado");
    Serial.println("Servidor en http://servidormemoria");
  }else {
    Serial.println("Error iniciando respondedor MDNS!");
  }


  // Rutas
  server.on("/", root);
  server.on("/login", HTTP_GET, login);
  server.on("/grabarlogin", HTTP_POST, grabarlogin);
  server.on("/dashboard", HTTP_GET, dashboard);  
  
  server.on("/iluminacion", HTTP_GET, iluminacion);
  server.on("/iluact", HTTP_POST, iluact);
  server.on("/iludes", HTTP_POST, iludes);
  server.on("/ilu1on", HTTP_POST, ilu1on);
  server.on("/ilu1off", HTTP_POST, ilu1off); 

  server.on("/camara", HTTP_GET, camara);
  server.on("/camact", HTTP_POST, camact);
  server.on("/camdes", HTTP_POST, camdes);
  server.on("/cam1on", HTTP_POST, cam1on); 
  server.on("/cam1off", HTTP_POST, cam1off);

  server.on("/seguridad", HTTP_GET, seguridad);
  server.on("/segact", HTTP_POST, segact);
  server.on("/segdes", HTTP_POST, segdes);
  server.on("/seg1on", HTTP_POST, seg1on);
  server.on("/seg1off", HTTP_POST, seg1off); 
  server.on("/desalarm", HTTP_POST, desalarm);

  server.on("/interruptor", HTTP_GET, interruptor);
  server.on("/inteact", HTTP_POST, inteact);
  server.on("/intedes", HTTP_POST, intedes);
  server.on("/inte1on", HTTP_POST, inte1on); 
  server.on("/inte1off", HTTP_POST, inte1off); 

  server.on("/agua", HTTP_GET, agua);
  server.on("/aguact", HTTP_POST, aguact);
  server.on("/agudes", HTTP_POST, agudes);
  server.on("/agu1on", HTTP_POST, agu1on); 
  server.on("/agu1off", HTTP_POST, agu1off); 

  server.on("/luz", HTTP_GET, luz);
  server.on("/luzact", HTTP_POST, luzact);
  server.on("/luzdes", HTTP_POST, luzdes);
  server.on("/luz1on", HTTP_POST, luz1on); 
  server.on("/luz1off", HTTP_POST, luz1off); 

  server.on("/movimiento", HTTP_GET, movimiento);
  server.on("/movact", HTTP_POST, movact);
  server.on("/movdes", HTTP_POST, movdes);
  server.on("/mov1on", HTTP_POST, mov1on); 
  server.on("/mov1off", HTTP_POST, mov1off); 
   

  // Para las páginas no encontradas
  server.onNotFound(notFound);
  // Habilita el CORS para poder intercambiar recursos con origen diferente al del servidor
  server.enableCORS(true);
  // Inicia el Servidor
  server.begin();
  Serial.println("Servidor HTTP Iniciado"); 

}

void loop(void) {
  // Revisar si hay peticiones entrantes
  server.handleClient();
  //Permite que el MDNS procese 
  MDNS.update(); 

  // Acciones dependiendo del mensaje serial recibido.
  if (stringRecibido) { 
    
    if(dataseg == "puerta1"){
      alertaMail();  
    } 
    if(solIP == "dirip"){
      Serial.print(WiFi.localIP());
      Serial.print("!");   
    } 
    dataseg = "";  
    solIP = "";  
    inputString = "";
    stringRecibido = false;
  }

  // Solicitar al Arduino valores del sensor DHT
  if(datath == ""){ 
    delay(500);
    dhtsolicitar();
  }

  // Solicitar al Arduino situación de los pines
  if(datapines == ""){ 
    delay(500);
    pinesolicitar();
  }

  // Solicitar al Arduino valores del sensor DHT
  if(datalarma == ""){ 
    delay(500);
    alarmasolicitar();
  }
  
}

// Disparador de evento al recibir información serial
void serialEvent() {
  while (Serial.available()) { // Mientras exista mensaje en puerto serial
    char inChar = (char)Serial.read(); // Leer letra a letra el mensaje serial recibido

  // Identificativos de mensajes 
  if (inChar == '/') { // Si al final de mensaje recibe /
    dataseg = inputString; // Variable igual al string
    stringRecibido = true; // Confirmador de mensaje recibido
  }
  if (inChar == '*') { // Si al final de mensaje recibe *
    datath = inputString; // Variable igual al string
    stringRecibido = true; // Confirmador de mensaje recibido   
  }
   if (inChar == '#') { // Si al final de mensaje recibe #
    datapines = inputString; // Variable igual al string
    stringRecibido = true; // Confirmador de mensaje recibido   
  }  
  if (inChar == '&') { // Si al final de mensaje recibe #
    datalarma = inputString; // Variable igual al string
    stringRecibido = true; // Confirmador de mensaje recibido   
  } 
  if (inChar == '!') { // Si al final de mensaje recibe #
    solIP = inputString; // Variable igual al string
    stringRecibido = true; // Confirmador de mensaje recibido   
  } 
  
  inputString += inChar; // Agrega letra a letra en un string
  
  }
}
