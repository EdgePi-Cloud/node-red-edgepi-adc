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
- 25

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

- **payload** (_number_)<br>
  The input selection -- the channel number (1 to 8) or differential channels number (1 to 4) depending on the read type. Ignored for read type `rtd`.
- **readType** (_string_)<br>
  `single`, `diff`, or `rtd`. Default is `single`.
- **dataRate** (_number_)<br>
  ADC data rate.
  Valid values for ADC 1: [`2.5`, `5`, `10`, `16.6`, `20`, `50`, `60`, `100`, `400`, `1200`, `2400`, `4800`, `7200`, `14400`, `19200`, `38400`] . Default is `38400`.
  Valid values for ADC 2: [`10`, `100`, `400`, `800`] . Default is `800`.
- **adc** (_number_)<br>
  ADC number to use for reads. Valid values are **1** and **2**. Forced to **2** when RTD `readType` is `rtd`. Default is **1**.

## Outputs

- Read type `single`:
  - `payload` (_number_)<br>
    Voltage reading of the specified single-ended analog input channel.
- Read type `diff`:
  - `payload` (_number_)<br>
    Differential voltage reading of the specified differential channels.
- Read type `rtd`:
  - `payload` (_number_)<br>
    RTD temperature reading in Celsius.
