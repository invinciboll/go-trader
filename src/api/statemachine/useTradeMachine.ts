import { useContext } from 'react';
import { TradeMachineContext } from './tradeMachineContext';

export const useTradeMachine = () => {
	const ctx = useContext(TradeMachineContext);

	if (!ctx) {
		throw new Error('useTradeMachine must be used inside TradeMachineProvider');
	}

	return ctx;
};
