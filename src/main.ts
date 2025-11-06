import { Observable } from '@/Observable';
import { Observer } from '@/Observer';

const obsTimeout$ = Observable.timeout(1000);

const unsubscribeTimeout = obsTimeout$.subscribe(
	new Observer({
		next: (value) => {
			console.log(value);
		},
		error: (error) => {
			console.error(error);
		},
		complete: () => {
			console.log('Complete');
		},
	}),
);

unsubscribeTimeout();

const obsInterval$ = Observable.interval(1000);

const unsubscribeInterval = obsInterval$.subscribe(
	new Observer({
		next: (value) => {
			console.log(value);
		},
		error: (error) => {
			console.error(error);
		},
		complete: () => {
			console.log('Complete');
		},
	}),
);

unsubscribeInterval();
