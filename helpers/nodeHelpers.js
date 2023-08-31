const rpc = require('@edgepi-cloud/edgepi-rpc')

async function performAsyncConfigurations(adcService, config) {
    // Do Configs based off input
      if(config.read === "voltage"){
        await voltageReadConfig(adcService, config)
      }
      else if(config.read === "differential"){
        await diffReadConfig(adcService,config)
      }
      else if(config.read === "RTD"){
        await rtdConfig(adcService, config)
      }
      else{
        throw new Error(`Unknown read method: ${config.method}`)
      }

      // Start conversions
      await adcService.startConversions(rpc.ADCNum[config.adc])
}

async function voltageReadConfig(adcService, config) {
    const adcConfigArg = {}
    if(config.adc === "ADC_1") {
        adcConfigArg.adc_1AnalogIn = rpc.AnalogIn[config.channel]
        adcConfigArg.adc_1DataRate = config.adc1DataRate
    }
    else{
        adcConfigArg.adc_2AnalogIn = rpc.AnalogIn[config.channel]
        adcConfigArg.adc_2DataRate = config.adc2DataRate
        
    }
    adcConfigArg.conversionMode = rpc.ConvMode.CONTINUOUS
    await adcService.setConfig(adcConfigArg)
}

async function diffReadConfig(adcService, config) {
    const adcNum = rpc.ADCNum[config.adc]
    const diff = rpc.DiffMode[config.diff]
    await adcService.selectDifferential(adcNum, diff)
}

async function rtdConfig(adcService, config) {
    await adcService.setRtd(true, rpc.ADCNum[config.adc])
}


module.exports = {
    performAsyncConfigurations
}