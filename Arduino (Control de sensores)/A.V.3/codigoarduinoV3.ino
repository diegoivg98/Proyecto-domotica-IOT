
#include <LiquidCrystal.h> // Incluir la librería de la pantalla
#include <DHT.h> // Incluir la librerías DHT
#include <ezBuzzer.h> // Incluir la librería del Buzzer 
#include <EEPROM.h> // Incluir la librería de la EEPROM
#include <ArduinoJson.h> // Incluir la librería para manejar JSON
#define DHTPIN 12 // Pin de datos sensor DHT
#define DHTTYPE DHT11 // Definir que el sensor es un DHT11 (modelo) 
DHT dht(DHTPIN, DHTTYPE); // Especificar el pin y el modelo del sensor de temperatura y humedad 

// Inicializar la libreria de la pantalla LCD con los números de los pines de la interface
LiquidCrystal lcd(7, 6, 5, 4, 3, 2);

String stringIn = "";         // String de entrada
bool stringRecibido = false;  // Comprobar que entró un mensaje serial

bool txdone = false; // Booleano para controlar que se envíe una vez el texto en el ciclo

// Constantes
const int led = 13;
const int pinFoto = A0; // Asignar para establecer pin A0 para fotoresistencia
const int pinPIR = A1; // Asignar para establecer pin A1 para sensor PIR
const int luz = A2; // Asignar para establecer pin A2 para luz automática 
const int agua = A3; // Asignar para establecer pin A3 para paso de agua inteligente
const int interruptor = A4; // Asignar para establecer pin A4 para Interruptor inteligente
const int iluminacion = A5; // Asignar para establecer pin A2 para Luz inteligente
const int seguridad = 8; // Asignar para establecer pin 8 para leer sensor de puerta
const int BUZZER_PIN = 9; // Asignar para establecer pin 9 para Buzzer
const int piraccion = 10; // Asignar para establecer pin 10 para leer la acción del sensor PIR
const int pir1 = 10; //Posición en memoria para el sensor pir1
const int ilu1 = 15; //Posición en memoria para el sensor ilu1
const int inte1 = 20; //Posición en memoria para el sensor inte1
const int agu1 = 25; //Posición en memoria para el sensor agua1
const int alarmactivada = 85; //Posición en memoria para el manejo de la alarma
const int pinIP = 11; // Asignar para establecer pin 11 para ver IP

// Variables
int option;
String data = "";
String dirIP = "";
String inputString = ""; // String de entrada 
int seguridadState = 0; // Se usa para pasar el valor de si esta abierta la puerta o no
int luzNivel = 0; // Variable para el nivel de la luz recibida
int entrada1 = 5; // Posición en memoria para el sensor entrada1
float datat = 0; // Variable para la temperatura
float datah = 0; // Variable para la humedad
int botonIpEstado = 0; // Variable para la detectar el botón de ver IP

// Inicializar el Buzzer en el pin 9 
ezBuzzer buzzer(BUZZER_PIN); 

// Definir la melodia a sonar (melodia de 2 tonos como una alarma)
int melody[] = {
  NOTE_C7, NOTE_A3
};

// Duracion de las notas
int noteDurations[] = {
  5, 6
};
int noteLength;

int puerta1 = 0; //Posición en memoria para el sensor puerta1
byte value;

int pirEstado = LOW; 
int pirFuncion = LOW; 

String pines = ""; 

// Sección para mantener actualizado el estado de los pines en el NodeMCU
void actualizarPines() {  
 
  Serial.print(String(EEPROM.read(ilu1)) + 
               String(EEPROM.read(inte1)) + 
               String(EEPROM.read(agu1)) + 
               String(EEPROM.read(pir1)) + 
               String(EEPROM.read(entrada1)) + 
               String(EEPROM.read(puerta1)) + "#" );
 
}

void actualizarAlarma() {
  
  Serial.print(String(EEPROM.read(alarmactivada)) + "&" );
  
}

void setup() {
  
  lcd.begin(16, 2); // Especificar cuantas columnas y filas tiene la pantalla

  Serial.begin(9600); // Inicializar el puerto serial en 9600 baudios
  dht.begin(); // Inicializar el sensor de temperatura y humedad
    
  // Establecer los pines necesarios como salida
  pinMode(led, OUTPUT); 
  pinMode(iluminacion, OUTPUT); 
  pinMode(interruptor, OUTPUT); 
  pinMode(agua, OUTPUT); 
  pinMode(luz, OUTPUT); 
  pinMode(piraccion, OUTPUT); 

  // Establecer los pines necesarios como entrada
  pinMode (pinFoto,INPUT);
  pinMode(seguridad, INPUT);
  pinMode(pinPIR, INPUT);
  pinMode(pinIP, INPUT);

  // Establecer los pines necesarios para el control de los relé en HIGH o LOW al inicio dependiendo de los valores almacenados en memoria
  digitalWrite(iluminacion, EEPROM.read(ilu1) == 1 ? LOW : HIGH);
  digitalWrite(interruptor, EEPROM.read(inte1) == 1 ? LOW : HIGH);
  digitalWrite(agua, EEPROM.read(agu1) == 1 ? LOW : HIGH);
  digitalWrite(luz, EEPROM.read(entrada1) == 1 ? LOW : HIGH);

  noteLength = sizeof(noteDurations) / sizeof(int); // Necesario para la librería del Buzzer

}

void loop() { 
  
  seguridadState = digitalRead(seguridad); // Lee el pin con el sensor magnético 
  luzNivel = analogRead(pinFoto); // Lee el pin con el sensor fotoresistencia 
  pirEstado = digitalRead(pinPIR); // Lee el pin con el sensor PIR
  botonIpEstado = digitalRead(pinIP); // Lee el pin para obtener IP
   
  buzzer.loop(); // Hace funcionar el buzzer dentro del loop
  
  lcd.setCursor(0, 0); // Estable del cursor de la pantalla en la posicion inicial (0,0)
  float h = dht.readHumidity(); // Variable para leer humedad
  float t = dht.readTemperature(); // Variable para leer temperatura 

  // Si algún valor cambian envía la actualización al NodeMCU
  if(datat != t || datah != h){
    String json = "{\"temperatura\":\"" + String(t,1) + "\", \"humedad\":\"" + String(h,0) + "\"}*";
    Serial.print(json);
  }
  
  datat=t; // Carga el valor de temperatura en la variable de control
  datah=h; // Carga el valor de humedad en la variable de control
  
  // En caso de sensor malo o desconectado 
  if (isnan(h) || isnan(t)) { 
    lcd.setCursor(0,0);
    lcd.print(F("Sensor DHT error"));//F para imprimir constantes
    return;
  }
  
  // Muestra la temperatura y la humedad por pantalla     
  lcd.print(F("T: "));
  lcd.print(t,1);
  lcd.print(F("C"));
  lcd.print(F(" Hu: "));
  lcd.print(h,0);
  lcd.print(F("%"));
  
  lcd.setCursor(0, 1); // Estable del cursor de la pantalla en la posición (0,1)
  

  // Manejo de acciones al recibir mensajes por puerto serial
  if (stringRecibido) {    

    //iluminacion 
    if (data == "ilu1off") { // Si recibe "ilu1off"

      EEPROM.put(ilu1,0); // Graba estado apagado en memoria
       
      digitalWrite(iluminacion, HIGH); // Desaactiva el pin de iluminacion (desactiva el Relé que enciende la luz) 
      
      if(EEPROM.read(alarmactivada) == 0 ){ // Si el sensor de la puerta no esta activado (HIGH puerta cerrada)
        lcd.print("Luz principal apagada");//21-16=5
        delay(400); 
      
        for (int pos = 0; pos < 5; pos++) {        
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 5; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);
        } 
      }
      actualizarPines(); // Actualiza el estado de los pines (apagado o encendido)
   }
    
    if (data == "ilu1on") {    

      EEPROM.put(ilu1,1); //Graba estado encendido en memoria
      
      digitalWrite(iluminacion, LOW); // Activa el pin de iluminacion (activa el Relé que enciende la luz) 
      
      if(EEPROM.read(alarmactivada) == 0){
        lcd.print("Luz principal encendida");//23-16=7
        delay(400); 
    
        for (int pos = 0; pos < 7; pos++) {      
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 7; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);                         
        }    
      }
      actualizarPines();  
   }


    //interruptor
    if (data == "inte1off") { 

      EEPROM.put(inte1,0);    
           
      digitalWrite(interruptor, HIGH); 
      
      if(EEPROM.read(alarmactivada) == 0){
        lcd.print("Interruptor apagado");//19-16=3
        delay(400); 
      
        for (int pos = 0; pos < 3; pos++) {        
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 3; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);
        } 
      }
      actualizarPines();
   }
    
    if (data == "inte1on") {    

      EEPROM.put(inte1,1);  
      
      digitalWrite(interruptor, LOW); 
      
      if(EEPROM.read(alarmactivada) == 0){
        lcd.print("Interruptor encendido");//21-16=5
        delay(400); 
    
        for (int pos = 0; pos < 5; pos++) {      
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 5; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);                         
        }
      } 
      actualizarPines();
   }



    //Paso de agua
    if (data == "agu1off") {   

      EEPROM.put(agu1,0);  
              
      digitalWrite(agua, HIGH); 
      
      if(EEPROM.read(alarmactivada) == 0){
        lcd.print("Paso de agua apagado");//20-16=4
        delay(400); 
      
        for (int pos = 0; pos < 4; pos++) {        
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 4; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);
        } 
      }
      actualizarPines();
   }
    
    if (data == "agu1on") {    
     
      EEPROM.put(agu1,1); 
      
      digitalWrite(agua, LOW); 

      if(EEPROM.read(alarmactivada) == 0){
        
        lcd.print("Paso de agua encendido");//22-16=6
        delay(400); 
    
        for (int pos = 0; pos < 6; pos++) {      
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 6; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);                         
        }    
      } 
      actualizarPines(); 
   }      




    //Seguridad
    if (data == "seg1off") {    
    
      EEPROM.put(puerta1,0);
      
      if(EEPROM.read(alarmactivada) == 0){
        lcd.print("Puerta 1 desactivada");//20-16=4
        delay(400); 
      
        for (int pos = 0; pos < 4; pos++) {        
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 4; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);
        } 
      }
      actualizarPines();
   }
    
    if (data == "seg1on") {    
     
      EEPROM.put(puerta1,1);
      
      if(EEPROM.read(alarmactivada) == 0){
      
        lcd.print("Puerta 1 activada");//17-16=1
        delay(400); 
    
        for (int pos = 0; pos < 1; pos++) {      
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 1; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);                         
        }    
      } 
      actualizarPines(); 
   } 



    //Luz automática
    if (data == "luz1off") {    
    
      EEPROM.put(entrada1,0);
      
      if(EEPROM.read(alarmactivada) == 0){
        lcd.print("AutoLuz entrada apagada");//23-16=7
        delay(400); 
      
        for (int pos = 0; pos < 7; pos++) {        
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 7; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);
        } 
      }
      actualizarPines();
   }
    
    if (data == "luz1on") {    
     
      EEPROM.put(entrada1,1);
      
      if(EEPROM.read(alarmactivada) == 0){
        
        lcd.print("AutoLuz entrada encendida");//25-16=9
        delay(400); 
    
        for (int pos = 0; pos < 9; pos++) {      
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 9; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);                         
        }    
      } 
      actualizarPines(); 
   }      



    //Movimiento
    if (data == "mov1off") {    
    
      EEPROM.put(pir1,0);
      
      if(EEPROM.read(alarmactivada) == 0){
        lcd.print("Sensor de movimiento apagado");//28-16=12
        delay(400); 
      
        for (int pos = 0; pos < 12; pos++) {        
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 12; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);
        } 
      }
      actualizarPines();
   }
    
    if (data == "mov1on") {    
     
      EEPROM.put(pir1,1);
      
      if(EEPROM.read(alarmactivada) == 0){
        
        lcd.print("Sensor de movimiento encendido");//30-16=14
        delay(400); 
    
        for (int pos = 0; pos < 14; pos++) {      
          lcd.scrollDisplayLeft();
          delay(200);
        }
          
        for (int pos = 0; pos < 14; pos++) {  
          lcd.scrollDisplayRight();           
          delay(200);                         
        }    
      }
      actualizarPines();  
   }   



    //Temperatura
    if (data == "dht") {       
         
      //Serial.print(String(int(t))+"/");
      String json = "{\"temperatura\":\"" + String(t,1) + "\", \"humedad\":\"" + String(h,0) + "\"}*";
      Serial.print(json);
           
   }


    //Pines
    if (data == "pines") {       
    
      actualizarPines();     
      
   }

    //Alarma
    if (data == "alarma") {     
     
      actualizarAlarma();     
      
   }


    //Desactivar alarma
    if (data == "desalarm") {      
      
      EEPROM.put(alarmactivada,0);
      buzzer.stop();
      txdone = false;
      actualizarAlarma();
   }
      
         
    data = ""; 
    inputString = ""; 
    stringRecibido = false;
}  
  
  

  // Acciones dependiendo de la lectura del nivel de luz
  if(EEPROM.read(entrada1) == 1){
    if(luzNivel >= 100){ //160
      
      if(digitalRead(luz) == 0){
        digitalWrite(luz, HIGH); 
      }
      
    }else if(luzNivel < 100){ //160
      
      if(digitalRead(luz) == 1){
         digitalWrite(luz, LOW); 
      }      
    }
  }
  

   // Acciones dependiendo de la lectura del pin del sensor magnético 
   if(EEPROM.read(puerta1) == 1){     

     if (seguridadState == LOW || EEPROM.read(alarmactivada) == 1) {
      
      if(txdone == false){
      Serial.print("puerta1/");    
      txdone = true; 
      EEPROM.put(alarmactivada,1);
      actualizarAlarma();
    }
 
    lcd.print("Puerta 1 abierta"); 
   
    if (buzzer.getState() == BUZZER_IDLE) {
      buzzer.playMelody(melody, noteDurations, noteLength); 
    }
     
      
   }else {
      
    //buzzer.stop();
    //txdone = false; 
      
   }   
  
  } 



  // Acciones dependiendo de la lectura del pin del sensor PIR 
  if(EEPROM.read(pir1) == 1){
    if (pirEstado == HIGH){  //si está activado     
       
       if (pirFuncion == LOW) {  //si previamente estaba apagado
          digitalWrite(piraccion, HIGH);  //Relé ON
          pirFuncion = HIGH;
          Serial.println("Movimiento detectado");          
       }
    } 
    else{   //si esta desactivado    
      
      if (pirFuncion == HIGH){  //si previamente estaba encendido
        digitalWrite(piraccion, LOW); // Relé OFF
        pirFuncion = LOW;
        Serial.println("Sensor de movimiento parado");       
      }     
    }
  }else if(EEPROM.read(pir1) == 0){
    
     if(digitalRead(piraccion) == HIGH){
       digitalWrite(piraccion, LOW); // Relé OFF
      }   

    if(pirFuncion == HIGH){
       pirFuncion = LOW;
      }
     
  }

  if (botonIpEstado == HIGH) {    
    lcd.print(dirIP);
  }

  if(dirIP == ""){
    delay(500);
    Serial.print("dirip!");  
  }


   lcd.print("                "); // borra la parte de abajo de la pantalla  
    
}

//Disparador de evento al recibir información serial
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read(); // Leer letra a letra el mensaje serial recibido
    if (inChar == '/') { // Si al final de mensaje recibe /
      data = inputString; // Variable igual al string
      stringRecibido = true; // Confirmador de mensaje recibido
    }
    if (inChar == '!') { // Si al final de mensaje recibe !
      dirIP = inputString; // Variable igual al string
      stringRecibido = true; // Confirmador de mensaje recibido
    }    
    inputString += inChar; // Agrega letra a letra en un string
  } 
}
 
