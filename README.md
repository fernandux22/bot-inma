# bot-inma
## Modo de uso
### Como descargarlo e iniciarlo
+ Abre el terminal de comandos o CMD
+ Descargatelo con "git clone https://github.com/fernandux22/bot-inma"
+ Deberás abrirlo con el bloc de notas o algún editor para poner el token para poder conectarlo a twitch
  Esto si lo haces conmigo lo ideal sería que no me enseñes el token por seguridad
+ descargar node de https://nodejs.org/es
+ Habría que instalar algunas librerias que se necesitan
+ Escribe "cd bot-inma"
+ Inicialo con "node main.js"

### Comandos a usar
+ !jugar para entrar en la lista
+ !posicion para ver la posicion donde estas o la que esta otro si pones su nombre
+ !salir para salirse de la lista

### Uso de la página web
+ Para entrar escribe en navegador la ruta que te sale en el terminal una vez iniciado
  - generalmente es http://localhost:3000
+ A medida que vayan entrando jugadores apareceran en la lista con su rango (nada,sub,vip,mod)
  - por defecto esta puesto que los sub/vip/mod tengan 2 partidas y los demas 1
+ El botón de resetear la lista, borra todos los jugadores
+ El botón de deshacer último cambio, deshace el último cambio hecho (almacena varios cambios)
+ El botón de eliminar de cada jugador, lo borra de la lista
+ El botón de añadir al equipo de cada jugador, resalta al jugador para que sepas el equipo
+ El botón de jugar tienes que darle solo cuando inicies la partida para reducir el número de partidas restantes
  de cada jugador resaltado




-------------------------------------------------------------------------------------------------------------------

To-Do:
- pagina web local que lea y reciba los datos del json en tiempo real (hecho)
  - boton para quitar de la lista (hecho)
  - posible seleccionador de varias partidas de sub/vip/mod (hecho)
  - descartado del equipo actual -> boton que resalta al jugador en el equipo (hecho)
  - boton para deshacer cambio (hecho)
  - boton para reiniciar la lista (hecho)
  - ordenar los jugadores por rango: sub>mod>vip>resto (hecho)

- comando !salir para que la gente se salga de la lista sola (hecho)
- comando !posicion para indicar la posicion del jugador en la lista
  - abandonado por imposibilidad de mandar el mensaje solo para persona por el chat a no ser que sea por susurro

- Añadido favicon igual a los puntos (hecho)
- intento de poner varias partidas por jugador (hecho)