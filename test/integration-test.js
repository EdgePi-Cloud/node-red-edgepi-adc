const helper = require('node-red-node-test-helper');
const adcNode = require('../edgepi-adc');

helper.init(require.resolve('node-red'));

describe('edgepi-adc Node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should read RTD and return temperature', function (done) {
        const flow = [
            {
                id: 'n1',
                type: 'edgepi adc',
                name: 'adc-test',
                transport: 'Network',
                tcpAddress: 'edgepi-x7kehf.local',
                tcpPort: 5555,
                read: 'RTD',
                wires: [['n2']]
            },
            {
                id: 'n2',
                type: 'helper'
            }
        ];

        helper.load(adcNode, flow, function () {
            const n2 = helper.getNode('n2');
            const n1 = helper.getNode('n1');

            n2.on('input', function (msg) {
                msg.payload.should.be.a.Number();
                done();
            });

            n1.receive({ payload: '' });
        });
    });
});
