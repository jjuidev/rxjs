import { Observer } from '@/Observer';

type Unsubscribe = () => void;
type Subscribe<T> = (observer: Observer<T>) => Unsubscribe;

export class Observable {
	constructor(public readonly subscribe: Subscribe<any>) {}

	static timeout(ms: number) {
		const subscribe = (observer: Observer<any>): Unsubscribe => {
			const timeoutId = setTimeout(() => {
				observer.next();
				observer.complete();
			}, ms);

			const unsubscribe = () => {
				clearTimeout(timeoutId);
			};

			return unsubscribe;
		};

		return new Observable(subscribe);
	}

	static interval(ms: number) {
		const subscribe = (observer: Observer<any>): Unsubscribe => {
			const intervalId = setInterval(() => {
				observer.next();
			}, ms);

			const unsubscribe = () => {
				clearInterval(intervalId);
			};

			return unsubscribe;
		};

		return new Observable(subscribe);
	}
}
