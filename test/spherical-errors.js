/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Maximum & RMS errors of haversine (spherical) distance calculations against Vincenty           */
/*                                                                                                */
/* Temperate zones 24°–66° latitude, 0°–90° longitude.                                            */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLonS from '../latlon-spherical.js';
import LatLonE from '../latlon-ellipsoidal-vincenty.js';

const latMin = 24;
const latMax = 66;

// ---- inverse

const errors = [];
for (let lat1=latMin; lat1<=latMax; lat1+=6) { // temperate latitudes in 6° increments
    for (let lat2=lat1; lat2<latMax; lat2+=6) {
        for (let lon=-90; lon<=+90; lon+=6) {  // hemisphere in 6° increments
            const p1Sph = new LatLonS(lat1, 0);
            const p2Sph = new LatLonS(lat2, lon);
            const p1Ell = new LatLonE(lat1, 0);
            const p2Ell = new LatLonE(lat2, lon);

            const dSph = p1Sph.distanceTo(p2Sph);
            const dEll = p1Ell.distanceTo(p2Ell);

            errors.push(dEll==0 ? 0 : Math.abs((dEll - dSph) / dEll));
        }
    }
}

const maxErrInv = errors.reduce((pre, cur) => Math.max(pre, cur));
const rmsErrInv = Math.sqrt(errors.reduce((pre, cur) => pre + cur*cur)/errors.length);

console.info('max inv error', (maxErrInv*100).toFixed(2)+'%');
console.info('rms inv error', (rmsErrInv*100).toFixed(2)+'%');

// compare errors for distance below 1km?

// ---- direct (up to 100km)

errors.length = 0;
for (let lat=latMin; lat<=latMax; lat+=6) { // temperate latitudes in 6° increments
    for (let brng=0; brng<360; brng+=10) {  // 360° of bearings in 10° increments
        const p1Sph = new LatLonS(lat, 0);
        const p1Ell = new LatLonE(lat, 0);

        for (let d=1e3; d<100e3; d+= 1e3) { // 1..100km in 1km increments
            const destSph = p1Sph.destinationPoint(d, brng);
            const destEll = p1Ell.destinationPoint(d, brng);
            const diff = destEll.distanceTo(new LatLonE(destSph.lat, destSph.lon));

            errors.push((diff) / d);
        }
    }
}


const maxErrDir = errors.reduce((pre, cur) => Math.max(pre, cur));
const rmsErrDir = Math.sqrt(errors.reduce((pre, cur) => pre + cur*cur)/errors.length);

console.info('max dir error', (maxErrDir*100).toFixed(2)+'%');
console.info('rms dir error', (rmsErrDir*100).toFixed(2)+'%');
