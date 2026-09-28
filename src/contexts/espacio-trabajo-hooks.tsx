import { useContext } from 'react';
import { EspacioTrabajoContext } from './espacio-trabajo';

const useEspacioTrabajo = () => useContext(EspacioTrabajoContext);

export {
    useEspacioTrabajo
};
