module.exports = async function (RED) {
  const rpc = require("@edgepi-cloud/edgepi-rpc");

  function AdcNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let read = config.read.toLowerCase();
    let inputSelection = read === "single" ? config.channel : config.diff;
    let adcNum = config.adcNum;
    let dataRate = adcNum === 1 ? config.adc1DataRate : config.adc2DataRate;

    initializeNode(config)
      .then((adc) => {
        node.on("input", async function (msg, send, done) {
          node.status({ fill: "green", shape: "dot", text: "input received" });
          try {
            read = msg.readType || read; //prioritize the inputs in the msg
            adcNum = msg.adc || adcNum;
            inputSelection = msg.payload || inputSelection;
            dataRate = msg.dataRate || dataRate;

            if (read !== "rtd") {
              await adc.setRtd(false, adcNum - 1);
            }
            await setConfigurations(adc);

            let response;
            if (read === "rtd") {
              response = await adc.readRtdTemperature();
            } else if (read === "single" || read === "diff") {
              response = await adc.readVoltage(adcNum - 1);
            }

            msg = { payload: response };
          } catch (error) {
            msg = { payload: error };
            console.error(error);
          }
          send(msg);
          done?.();
        });

        node.on("close", async () => {
          await adc.stopConversions(false, rpc.ADCNum[adcNum]);
          await adc.setRtd(false, adcNum - 1);
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
        await setConfigurations(adc, config);
        await adc.startConversions(adcNum - 1);
        return adc;
      } catch (error) {
        console.error(error);
        node.status({
          fill: "red",
          shape: "ring",
          text: "adc failed to initialize",
        });
      }
    }

    async function setConfigurations(adc) {
      if (read === "single") {
        const dataRateStr = "SPS_" + dataRate.toString().replace(".", "P");
        const configArg = {
          [`adc_${adcNum}AnalogIn`]: inputSelection - 1,
          [`adc_${adcNum}DataRate`]: dataRateStr,
          conversionMode: rpc.ConvMode.CONTINUOUS,
        };
        await adc.setConfig(configArg);
      } else if (read === "diff") {
        await adc.selectDifferential(adcNum - 1, inputSelection - 1);
      } else if (read === "rtd") {
        adcNum = 2; // force adc to 2
        await adc.setRtd(true, adcNum - 1);
      }
    }
  }
  RED.nodes.registerType("adc", AdcNode);
};
