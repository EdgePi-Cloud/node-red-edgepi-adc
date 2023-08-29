module.exports = function (RED) {
    const rpc = require('@edgepi-cloud/edgepi-rpc');
  
    function AdcNode(config) {
      // Create new node instance with user config
      RED.nodes.createNode(this, config);
      const node = this;
      const ipc_transport = "ipc:///tmp/edgepi.pipe"
      const tcp_transport = `tcp://${config.tcpAddress}:${config.tcpPort}`
      const transport = (config.transport === "Network") ? tcp_transport : ipc_transport;
      
      // Init adc
      const adc = new rpc.AdcService(transport)
  
      if (adc){
        console.info("ADC node initialized on:", transport);
        node.status({fill:"green", shape:"ring", text:"adc initialized"});
      }

      // Enforce continuous conversion mode
      adc.setConfig({conversionMode:rpc.ConvMode.CONTINUOUS})

      // Do Configs based off input
      if(config.read === "voltage"){
        const adcConfigArg = {
          [(config.adc === "ADC_1") ? "adc_1AnalogIn" : "adc_2AnalogIn"]: rpc.AnalogIn[config.channel]
        };
        adc.setConfig({...adcConfigArg, adc_1DataRate: rpc.ADC1DataRate.SPS_38400})
      }
      if(config.read === "differential"){
        const adc = rpc.ADCNum[config.adc]
        const diff = rpc.DiffMode[config.diff]
        adc.selectDifferential(adc, diff)
      }
      
      // Input event listener
      node.on('input', async function(msg,send,done){
        node.status({fill:"green", shape:"dot", text:"input recieved"});
        try{
          let response;
          if(config.read === "voltage" || config.read === "differential"){
            response = await adc.readVoltage();
          }

          msg.payload = response;
        }
        catch(error){
          msg.payload = error;
          console.error(error)
        }
        
        // Send msg
        send(msg)
        
        if (done) {
          done();
        }
      });

    }
    
    RED.nodes.registerType('edgepi-adc-node', AdcNode);
    
  };