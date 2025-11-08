// import { Observable } from '@/Observable';
// import { Observer } from '@/Observer';

// const obsTimeout$ = Observable.timeout(1000);

// const unsubscribeTimeout = obsTimeout$.subscribe(
// 	new Observer({
// 		next: (value) => {
// 			console.log(value);
// 		},
// 		error: (error) => {
// 			console.error(error);
// 		},
// 		complete: () => {
// 			console.log('Complete');
// 		},
// 	}),
// );

// unsubscribeTimeout();

// const obsInterval$ = Observable.interval(1000);

// const unsubscribeInterval = obsInterval$.subscribe(
// 	new Observer({
// 		next: (value) => {
// 			console.log(value);
// 		},
// 		error: (error) => {
// 			console.error(error);
// 		},
// 		complete: () => {
// 			console.log('Complete');
// 		},
// 	}),
// );

// unsubscribeInterval();

import { filter, flatMap, from, map, mergeMap, of, zip } from 'rxjs';

const array = [1, 2, 3, 4, 5];

// from(array)
// 	.pipe(map((value) => value * 2))
// 	.subscribe((value) => {
// 		console.log(value);
// 	});

// from(array)
// 	.pipe(
// 		mergeMap((value) => of(value + 10)),
// 		filter((value) => value % 2 === 0),
// 	)
// 	.subscribe((value) => {
// 		console.log(value);
// 	});

zip(from(array), from(array).pipe(map((value) => value * 2)))
	.pipe(
		mergeMap((value) => value),
		filter((value) => value % 2 === 0),
	)
	.subscribe((value) => {
		console.log(value);
	});
