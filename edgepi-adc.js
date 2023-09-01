module.exports = async function (RED) {
    const rpc = require('@edgepi-cloud/edgepi-rpc');
    const { performAsyncConfigurations} = require('./helpers/nodeHelpers');
  
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
      else{
        node.status({fill:"red", shape:"ring", text:"adc failed to initialize"});
        throw new Error("ADC failed to initialize.")
      }

      // Perform async configurations
      performAsyncConfigurations(adc,config).then( () => {

        // Input event listener
        node.on('input', async function(msg,send,done){
          node.status({fill:"green", shape:"dot", text:"input recieved"});
          try{
            let response;
            if(config.read === "voltage" || config.read === "differential"){
              response = await adc.readVoltage(rpc.ADCNum[config.adc]);
            }
            else if(config.read === "RTD") {
              response = await adc.readRtdTemperature();
              
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

        node.on('close', async () => {
          await adc.stopConversions(false, rpc.ADCNum[config.adc])
          await adc.setRtd(false, rpc.ADCNum.ADC_2)
        })

      })
      .catch(error => {
        console.error(error)
      })
      
    }
    
    RED.nodes.registerType('edgepi-adc-node', AdcNode);
    
  };