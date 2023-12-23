module.exports = async function (RED) {
  const rpc = require("@edgepi-cloud/edgepi-rpc");

  function AdcNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let read = config.read;
    let channel = config.channel;
    let diff = config.diff;
    let adcNum = config.adcNum;
    let adc1DataRate = config.adc1DataRate;
    let adc2DataRate = config.adc2DataRate;

    initializeNode(config)
      .then(() => {
        node.on("input", async function (msg, send, done) {
          node.status({ fill: "green", shape: "dot", text: "input recieved" });
          try {
            let response;
            read = msg.read ?? read;
            if (read === "voltage" || read === "differential") {
              response = await adc.readVoltage(adc-1);
            } else if (read === "RTD") {
              response = await adc.readRtdTemperature();
            }

            msg.payload = response;
          } catch (error) {
            msg.payload = error;
            console.error(error);
          }

          send(msg);

          done?.();
        });

        node.on("close", async () => {
          await adc.stopConversions(false, rpc.ADCNum[config.adc]);
          await adc.setRtd(false, rpc.ADCNum.ADC_2);
        });
      })
      .catch((error) => {
        console.error(error);
      });

    async function initializeNode(config) {
      const transport =
        config.transport === "Network"
          ? `tcp://${config.tcpAddress}:${config.tcpPort}`
          : "ipc:///tmp/edgepi.pipe";

      try {
        const adc = new rpc.AdcService(transport);
        console.info("ADC node initialized on:", transport);
        node.status({ fill: "green", shape: "ring", text: "adc initialized" });
        await setInitialConfigurations(adc, config);
        await adcService.startConversions(adcNum - 1);
      } catch (error) {
        console.error(error);
        node.status({
          fill: "red",
          shape: "ring",
          text: "adc failed to initialize",
        });
      }
    }

    async function setInitialConfigurations(adc, config) {
      if (config.read === "voltage") {
        const adcConfigArg = {};
        if (adcNum === 1) {
          adcConfigArg.adc_1AnalogIn = channel - 1;
          adcConfigArg.adc_1DataRate = config.adc1DataRate;
        } else {
          adcConfigArg.adc_2AnalogIn = channel - 1;
          adcConfigArg.adc_2DataRate = config.adc2DataRate;
        }
        adcConfigArg.conversionMode = rpc.ConvMode.CONTINUOUS;
        await adc.setConfig(adcConfigArg);
      } else if (read === "differential") {
        const diff = rpc.DiffMode[config.diff];
        await adc.selectDifferential(adcNum - 1, diff);
      } else if (read === "RTD") {
        await adc.setRtd(true, adcNum - 1);
      } else {
        throw new Error(`Unknown read method: ${config.method}`);
      }
    }
  }
  RED.nodes.registerType("adc", AdcNode);
};
