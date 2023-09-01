# EdgePi ADC Node

## EdgePi ADC node that reads voltage, differential, and RTD.

## Details

Differential Types:

- DIFF1: Ports 16 & 17
- DIFF1: Ports 19 & 20
- DIFF1: Ports 21 & 22
- DIFF1: Ports 24 & 25

Assigned ports for RTD measurements:

- 21
- 24
- 24

**NOTE:** Port 22 will also be disabled.

## Properties

- **RPC Server:** <br>
The connection to your EdgePi's RPC Server.
- **Reading:** <br>
The type of reading you want the ADC to do next.
- **ADC:**<br>
Which ADC you want to use for the next reading.
- **ADC Channel (when configured to read voltage):**<br>
Which analog channel you read from next.
- **Data Rate (when configured to read voltage):**<br>
The selected ADC's data rate. Note that data rates are different depending on which ADC you chose.
- **Differential (when configured to read differential):**<br>
The differential you want to read next.

## Inputs

- Any message can be used to trigger this node.

## Outputs

- When configured to read voltage:
  - `payload` (*number*)<br>
  Voltage reading of the specified analog input channel.
- When configured to read differential:
  - `payload` (*number*)<br>
  Voltage reading of the specified differential.
- When configured to read RTD:
  - `payload` (*number*)<br>
  RTD temperature reading.

