import { useContext } from 'react';
import { AdbContext } from './adbContext';

export const useAdb = () => {
	const ctx = useContext(AdbContext);

	if (!ctx) {
		throw new Error('useAdb must be used inside AdbProvider');
	}

	return ctx;
};
