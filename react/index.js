'use strict';

const { useEffect, useRef } = require('react');
const meBlip = require('../meBlip.js');

function useBlip(options = {}) {
  const instanceRef = useRef(null);

  useEffect(() => {
    const instance = new meBlip(options);
    instanceRef.current = instance;

    return () => {
      ['meblip-island-root', 'meblip-blocking-overlay', 'meblip-styles']
        .forEach(id => document.getElementById(id)?.remove());
      instanceRef.current = null;
    };
  }, []);

  return instanceRef.current;
}

module.exports = useBlip;
module.exports.useBlip = useBlip;
module.exports.meBlip = meBlip;
module.exports.default = useBlip;
