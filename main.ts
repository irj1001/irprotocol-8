/**
 * Explicação do código
 * 
 * Tanta modelação para aqui e para acolá para dizer que o que conta é o tempo que dura cada símbolo no meio. Por símbolo entende-se um pedaço de 6 períodos a 1 e uma tamanho variável a 0. Para encontrarmos o início do frame é preciso um símbolo especial. Para ser despoletada uma transição depois do último bit que funcione como trigger para receber o seu fim usa-se o mesmo quadro que por isso é denominado START/STOP. Na verdade eu usei dois no início e dois no fim. Reparei que funciona melhor. Inspitei-me em código de extensões mas depois percebi porque é que não há nada na net: os timings são tramados de controlar. Por esse motivo há uma função de calibração inicial mas que no meu caso dá maus resultados e por isso usei tempos que medi caso a caso. Podem precisar de ajustes em função de como cresça o peso de processamento do código.
 * 
 * Seguem-se algumas explicações das fontes de inspiração a que recorri para o emissor IR. Masi abaixo aparecerá para o recetor IR.
 * 
 * Emissor IR =============================================================
 * 
 * https://github.com/philipphenkel/pxt-powerfunctions/blob/master/powerfunctions.ts.
 * 
 * Recriei aqui a lógica do ficheiro "powerfunctions" da extensão acima realiza para enviar mensagens de 16 bits.
 * 
 * Ele tb usou o TSAL6100.
 * 
 * Se no meu slide procurar o "Modulated IR Signal" está lá um diagrama de como são codificados todos os bits!
 * 
 * Na verdade só não aparece muito explícito o número de períodos PWM mas pelo código é fácil deduzir.
 * 
 * O código começa por calcular quanto tempo a microbit leva em média para fazer algumas operações (calibração) de modo a que os timings sejam rigorosos.
 * 
 * As mensagens são um inteiro de 16 bits. no pior caso estes 16 bits demoram 522 períodos PWM (de 26 microsegundos cada), ou seja 13,572 milisegundos.
 * 
 * Eles usam um truque engraçado: repetem 5 vezes o envio, no terceiro envio esperam alguns ms a mais e no último ainda mais e em função do que chamam canal!!!
 * 
 * O Head inicial e final são constituídos por um marcador (ou seja um "1" modulado) e um espaço em branco iniciais e devem demorar 45 períodos ao todo: 6 o marcador e 39 em branco.
 * 
 * Um "1" é constituído por 27 períodos ao todo: 6 o marcador e 21 em branco.
 * 
 * Um "0" é constituído por 16 períodos ao todo: 6 o marcador e 10 branco.
 * 
 * Conseguimos distinguir os valores binário em transmissão pelo simples facto de termos (bit 0) ou não flutuações nos período que medeiam entre o 16 e o 22 depois de se dar início
 * 
 * =========================================================================
 * 
 * Adaptação ao meu jogo laser quest:
 * 
 * Não me pareceu em nada necessário incluir redundância. Talvez jogando de dia dê jeito. Por isso avanço já com o seguinte esquema:
 * 
 * Nas experiências comecei por usar IR_MARK=100, START_STOP_PAUSE=820, LOW_PAUSE=100 e HIGH_PAUSE=500.
 * 
 * funcionava para 2 bits mas não para 6 bits. Havia muitos erros de transmissão.
 * 
 * Naumentei para IR_MARK=200, START_STOP_PAUSE=1500, LOW_PAUSE=200 e HIGH_PAUSE=1000.
 * 
 * Adaptação ao meu jogo laser quest:
 * 
 * Não me pareceu em nada necessário incluir redundância. Talvez jogando de dia se mostre útil. Por isso avanço já com o seguinte esquema:
 * 
 * Nas experiências comecei por usar IR_MARK=100, START_STOP_PAUSE=820, LOW_PAUSE=100 e HIGH_PAUSE=500.
 * 
 * funcionava para 2 bits mas não para 6 bits. Havia muitos erros de transmissão.
 * 
 * Aumentei para IR_MARK=200, START_STOP_PAUSE=1500, LOW_PAUSE=200 e HIGH_PAUSE=1000 e funcionou perfeitamente com 6 bits.
 * 
 * Novo tempo máximo de quadro = (200*(4+18)) + 4*1500 + 18*1000 = 28,4 ms  (ainda assim muito baixo)
 * 
 * Não podemos esquecer que acresce a isto redundância. Aumentei para 4 o número de quadros SS a abrir e fechar a frame para ser ainda mais robusto pois estes quadros não possuem redundância binária.
 * 
 * O quadro terá 18 bits úteis. Juntando os 2 SS iniciais e 2 SS finais fico com um quadro que pode ter 360 a 666 períodos de 26 microsegundos, ou seja 9,360 ms a 18,648 ms.
 * 
 * Este tempo assumindo ainda que é vibrado por uma onda quadrada com um duty cycle de 50% é super seguro em termos de saúde ocular. Muitíssimo menos potência.
 * 
 * Adicionalmente permite-nos operar o LED com corrente alta sem perigo de aquecimento.
 * 
 * O esquema de redundância passa por enviar enviar três vezes seguidas e repetidas os mesmos 6 bits úteis base.
 * 
 * Este terão a seguinte interpretação: (msb) e1 e0 j3 j2 j1 j0 (lsb)
 * 
 * - ei são bits que representam uma de quatro equipas
 * 
 * - ji são bits que representam um de 16 jogadores da referida equipa
 * 
 * No total suportamos 64 players simultâneos.
 * 
 * O envio de três vezes seguidas facilita a lógica de envio e de receção.
 * 
 * Na receção faço votação dos bits recebidos. É preciso haver dois bits errados separados por seis bits para não detetar o erro, logo a comunicação é robusta.
 * 
 * Teremos de criar um modo inicial de programação (A+B) de cada pistola e capacete em que indicamos em cada Microbit, a função de operação desejada (pistola/capacete), a equipa (numa rotação de 4 valores) e depois o id do jogador numa rotação de 16 valores. Esse valor deve ser gravado na flash da microbit. O registo dos IDs deve ser feito inicialmente.
 * 
 * Ao receber o tiro o capacete ilumina-se com a cor da equipa alvejada por 2 segundos, depois em modo flash a cor da equipa que alvejou e novamente a continuo a cor da equipa alvejada. Desta forma por comunicação visual os jogadores percebem quem morreu e quem matou. Por rádio envia-se essa informação também, podendo a mesma ser consultada .
 * 
 * Posso ainda dar a possibilidade de programar dois modos de disparo: manual e automático: no primeiro envia-se uma bala. No segundo disparam-se 10 balas separadas por 100 ms.
 */
// // LOW
pins.onPulsed(DigitalPin.P2, PulseValue.High, function () {
    space = pins.pulseDuration()
    control.raiseEvent(
    EventBusSource.MICROBIT_ID_IO_P19,
    mark + space
    )
})
function transmitBitHigh () {
    pins.analogWritePin(AnalogPin.P0, 511)
    control.waitMicros(IR_MARK)
    pins.analogWritePin(AnalogPin.P0, 0)
    control.waitMicros(HIGH_PAUSE)
}
function detectBit () {
    if (pulseToPulse > START_STOP_PAUSE) {
        IRReceiveState = IRRCV_DETECT_BIT
    } else if (pulseToPulse > HIGH_PAUSE) {
        pushBitOne()
    } else if (pulseToPulse > LOW_PAUSE) {
        pushBitZero()
    }
}
control.onEvent(EventBusSource.MICROBIT_ID_IO_P19, EventBusValue.MICROBIT_EVT_ANY, function () {
    pulseToPulse = control.eventValue() - IR_MARK
    // Estamos a fornecer uma margem de erro para baixo e infinito para cima de 1500 que é o tempo de Low do pino 1.
    // No arranque o pulseToPulse será obviamente grande pois o led está apagado e P2 da Mircobit estará a High. O evento supostamente apenas é disparado no do período em que P2 esteve a High pois só assim a microbit nos poderia indicar o pulse duration.
    // Estamos a fornecer uma margem de erro de 10% para baixo e infinito para cima
    if (pulseToPulse > 1300 && pulseToPulse < 1700) {
        Reset()
        IRReceiveState = IRRCV_DETECT_BIT
    } else {
        // Estamos a fornecer uma margem de erro para baixo e infinito para cima de 1500 que é o tempo de Low do pino 1.
        // No arranque o pulseToPulse será obviamente grande pois o led está apagado e P2 da Mircobit estará a High. O evento supostamente apenas é disparado no do período em que P2 esteve a High pois só assim a microbit nos poderia indicar o pulse duration.
        // Estamos a fornecer uma margem de erro de 10% para baixo e infinito para cima
        // Estamos a fornecer uma margem de erro para baixo e infinito para cima de 1500 que é o tempo de Low do pino 1.
        // No arranque o pulseToPulse será obviamente grande pois o led está apagado e P2 da Mircobit estará a High. O evento supostamente apenas é disparado no do período em que P2 esteve a High pois só assim a microbit nos poderia indicar o pulse duration.
        // Estamos a fornecer uma margem de erro de 10% para baixo e infinito para cima
        if (pulseToPulse > 800 && pulseToPulse < 1200) {
            pushBitOne()
        } else if (pulseToPulse > 50 && pulseToPulse < 400) {
            pushBitZero()
        } else {
            basic.showNumber(pulseToPulse)
            Reset()
        }
    }
})
function enableIRDetection () {
    lasIRShotReceived = 0
    Reset()
}
// USER INTERFACE:
// 
// A+B four consecutive times (with 1 second) => Enter into configuration mode
// 
// 
// 
// Then the display will explain the configuration:
// 
// A: Swap between single shot and burst shot
// 
// B: Me-> :How many players I shot / ME<- :How many times I was shot / Best Team
// 
// A+B: How many shots I already use
input.onButtonPressed(Button.A, function () {
    PLAYER_ID += 1
    // Three consecutive replicas of PLAYER_ID for redundancy.
    SHOT_MESSAGE = (PLAYER_ID * 2 ** PLAYER_ID_BIT_SIZE + PLAYER_ID) * 2 ** PLAYER_ID_BIT_SIZE + PLAYER_ID
    basic.showNumber(SHOT_MESSAGE)
    IRShot()
    basic.clearScreen()
})
// A calibração parece não estar a resultar. Medi e afinei com valores fixos. O bloco ao lado é o código original (deixo para referência).
function transmitBitStartStop () {
    pins.analogWritePin(AnalogPin.P0, 511)
    control.waitMicros(IR_MARK)
    pins.analogWritePin(AnalogPin.P0, 0)
    control.waitMicros(START_STOP_PAUSE)
}
// Fonte de inspiração:
// 
// Recetor IR =============================================================
// 
// Extensão: https://github.com/1010Technologies/pxt-makerbit-ir-receiver/blob/master/infrared.ts
// 
// Na pasta Projet é o zip pxt-makerbit-ir-receiver-master.zip e o ficheiro infrared.ts
// 
// Usei como inspiração para desenhar o meu recetor que case com o de cima.
// 
// Como este terá uma thread em background será bom no final eu ter um projeto para o emissor e outro para o recetor.
// 
// Pelas minhas contas e assumindo que o pulseToPulse=tempo de mark + tempo de space
// 
// Sequência START_STOP demorará 45 períodos de 26 microsegundos ou seja pulseToPulse = 1014 microsegundos (IRMARK + START_STOP_PAUSE)
// 
// Sequência LOW demorará 16 períodos de 26 microsegundos ou seja pulseToPulse = 416 microsegundos (IRMARK + LOW_PAUSE)
// 
// Sequência HIGH demorará 27 períodso de 26 microsegundos ou seja pulseToPulse = 702 microsegundos  (IRMARK + HIGH_PAUSE)
// 
// 
// 
// 
// 
// Todos os valores foram afinados por mim de forma manual.
function detectStartStop () {
    // Estamos a fornecer uma margem de erro de 10% para baixo e infinito para cima
    if (pulseToPulse > 900) {
        IRReceiveState = IRRCV_DETECT_BIT
    }
}
function pushBitZero () {
    // Shift left de 1 bit
    messageBeingReceived = messageBeingReceived * 2
    receivedBits += 1
    if (receivedBits == SHOT_MESSAGE_BIT_SIZE) {
        lasIRShotReceived = messageBeingReceived
        control.raiseEvent(
        EventBusSource.MICROBIT_ID_IO_P20,
        0
        )
        Reset()
    }
}
// // HIGH
pins.onPulsed(DigitalPin.P2, PulseValue.Low, function () {
    mark = pins.pulseDuration()
})
control.onEvent(EventBusSource.MICROBIT_ID_IO_P20, EventBusValue.MICROBIT_EVT_ANY, function () {
    basic.showString("R=")
    basic.showNumber(lasIRShotReceived)
    basic.pause(1000)
    basic.clearScreen()
})
function pushBitOne () {
    // Shift left de 1 bit
    messageBeingReceived = messageBeingReceived * 2
    messageBeingReceived += 1
    receivedBits += 1
    if (receivedBits == SHOT_MESSAGE_BIT_SIZE) {
        lasIRShotReceived = messageBeingReceived
        control.raiseEvent(
        EventBusSource.MICROBIT_ID_IO_P20,
        1
        )
        Reset()
    }
}
// Fazia o trabalho do construtor de class InfraredDevice. Adaptei apenas para inicializar a porta analógica PWM.
function enableIRTransmission () {
    // We will use PWM, with a frequency of 38 KHz
    pins.analogWritePin(AnalogPin.P0, 0)
    pins.analogSetPeriod(AnalogPin.P0, 26)
    for (let index = 0; index <= 7; index++) {
        pins.analogWritePin(AnalogPin.P0, 511)
        control.waitMicros(1)
    }
    // We will use PWM, with a frequency of 38 KHz
    pins.analogWritePin(AnalogPin.P0, 0)
}
function transmitBitLow () {
    pins.analogWritePin(AnalogPin.P0, 511)
    control.waitMicros(IR_MARK)
    pins.analogWritePin(AnalogPin.P0, 0)
    control.waitMicros(LOW_PAUSE)
}
function Reset () {
    IRRCV_DETECT_START_STOP = 0
    IRRCV_DETECT_BIT = 1
    IRReceiveState = IRRCV_DETECT_START_STOP
    receivedBits = 0
    messageBeingReceived = 0
}
// Bits are sent starting on msb to lsb
function IRShot () {
    messageBeingSent = SHOT_MESSAGE
    // Em binário: 0100 0000 0000 0000
    // A máscara será usada para transmitir bit a bit
    mask = 2 ** (SHOT_MESSAGE_BIT_SIZE - 1)
    for (let index = 0; index < 4; index++) {
        transmitBitStartStop()
    }
    while (mask >= 1) {
        temp1 = Math.idiv(messageBeingSent, mask)
        if (temp1 == 1) {
            transmitBitHigh()
        } else {
            transmitBitLow()
        }
        messageBeingSent = messageBeingSent - temp1 * mask
        mask = mask / 2
    }
    for (let index = 0; index < 4; index++) {
        transmitBitStartStop()
    }
}
let temp1 = 0
let mask = 0
let messageBeingSent = 0
let IRRCV_DETECT_START_STOP = 0
let receivedBits = 0
let messageBeingReceived = 0
let SHOT_MESSAGE = 0
let lasIRShotReceived = 0
let IRRCV_DETECT_BIT = 0
let IRReceiveState = 0
let pulseToPulse = 0
let mark = 0
let space = 0
let HIGH_PAUSE = 0
let LOW_PAUSE = 0
let START_STOP_PAUSE = 0
let IR_MARK = 0
let SHOT_MESSAGE_BIT_SIZE = 0
let PLAYER_ID_BIT_SIZE = 0
let PLAYER_ID = 0
// Valor de 6 bits conforme explicação externa. Mais tarde esta valor deverá ser programável manualmente e armazenável de forma não volátil. Este valor vais ser colocado nas balas para identificar quem mata quem.
PLAYER_ID = 0
PLAYER_ID_BIT_SIZE = 6
// Vamos repetir a mensagem três vezes seguidas para robustez
SHOT_MESSAGE_BIT_SIZE = 3 * PLAYER_ID_BIT_SIZE
// -opetei por especificar valores diretamente depois de testar offline
IR_MARK = 200
START_STOP_PAUSE = 1500
LOW_PAUSE = 200
// Math.idiv((27 - 6) * 1000000, 38000) = 552
HIGH_PAUSE = 1000
enableIRTransmission()
enableIRDetection()
