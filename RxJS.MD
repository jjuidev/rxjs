# RxJS Version 7 - Hướng Dẫn Chi Tiết

## Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Khái niệm cơ bản](#khái-niệm-cơ-bản)
3. [Creation Operators](#creation-operators)
4. [Transformation Operators](#transformation-operators)
5. [Filtering Operators](#filtering-operators)
6. [Combination Operators](#combination-operators)
7. [Error Handling](#error-handling)
8. [Utility Operators](#utility-operators)
9. [Subjects](#subjects)
10. [Use Cases Thực Tế](#use-cases-thực-tế)

---

## Giới thiệu

RxJS (Reactive Extensions for JavaScript) là thư viện để lập trình reactive sử dụng Observables, giúp dễ dàng xử lý các luồng dữ liệu bất đồng bộ và events.

**Cài đặt:**

```bash
npm install rxjs@7
# hoặc
yarn add rxjs@7
```

**Import:**

```typescript
import { Observable, of, from, interval } from 'rxjs';
import { map, filter, tap, switchMap } from 'rxjs/operators';
```

---

## Khái niệm cơ bản

### Observable

Luồng dữ liệu có thể emit nhiều giá trị theo thời gian

```typescript
import { Observable } from 'rxjs';

const observable = new Observable((subscriber) => {
	subscriber.next(1);
	subscriber.next(2);
	subscriber.next(3);
	setTimeout(() => {
		subscriber.next(4);
		subscriber.complete();
	}, 1000);
});

console.log('Before subscribe');
observable.subscribe({
	next: (x) => console.log('Got value:', x),
	error: (err) => console.error('Error:', err),
	complete: () => console.log('Done'),
});
console.log('After subscribe');
```

### Observer

Object có các methods để nhận giá trị từ Observable

```typescript
const observer = {
	next: (value) => console.log('Next:', value),
	error: (err) => console.error('Error:', err),
	complete: () => console.log('Complete!'),
};

observable.subscribe(observer);
```

### Subscription

Đại diện cho việc thực thi Observable, dùng để hủy subscription

```typescript
import { interval } from 'rxjs';

const subscription = interval(1000).subscribe((x) => console.log(x));

setTimeout(() => {
	subscription.unsubscribe();
	console.log('Unsubscribed');
}, 5000);
```

### Operators

Functions thuần túy để xử lý collections với các operations như map, filter, concat, etc.

```typescript
import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

of(1, 2, 3, 4, 5)
	.pipe(
		filter((x) => x % 2 === 0),
		map((x) => x * 10),
	)
	.subscribe((x) => console.log(x));
```

### pipe()

Method của Observable dùng để **kết hợp nhiều operators lại với nhau** theo chuỗi (chain). Dữ liệu sẽ đi qua từng operator theo thứ tự từ trên xuống dưới.

**Tại sao cần pipe?**

- **Tree-shaking tốt hơn**: Chỉ bundle những operators bạn thực sự dùng
- **Dễ đọc**: Code rõ ràng, operators được sắp xếp tuần tự
- **Tránh prototype pollution**: Không extend prototype của Observable

**Ví dụ chi tiết:**

```typescript
import { of } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';

of(1, 2, 3, 4, 5)
	.pipe(
		tap((x) => console.log('Input:', x)), // 1. In giá trị ban đầu
		map((x) => x * 10), // 2. Nhân 10
		tap((x) => console.log('After map:', x)), // 3. In sau map
		filter((x) => x > 25), // 4. Lọc > 25
		tap((x) => console.log('After filter:', x)), // 5. In sau filter
	)
	.subscribe((x) => console.log('Final:', x));
```

**Flow của dữ liệu:**

```
1 → tap → map(10) → tap → filter(false) → ✗
2 → tap → map(20) → tap → filter(false) → ✗
3 → tap → map(30) → tap → filter(true) → tap → subscribe → 30
4 → tap → map(40) → tap → filter(true) → tap → subscribe → 40
5 → tap → map(50) → tap → filter(true) → tap → subscribe → 50
```

**Không dùng pipe:**

```typescript
// KHÔNG làm như này!
of(1, 2, 3)
	.map((x) => x * 2) // Error: Property 'map' does not exist
	.subscribe();
```

**Có thể tạo custom pipe:**

```typescript
import { pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// Tạo custom operator có thể tái sử dụng
const multiplyAndFilterGreaterThan = (multiplier: number, threshold: number) =>
	pipe(
		map((x: number) => x * multiplier),
		filter((x: number) => x > threshold),
	);

of(1, 2, 3, 4, 5)
	.pipe(multiplyAndFilterGreaterThan(10, 25))
	.subscribe((x) => console.log(x)); // 30, 40, 50
```

---

## Creation Operators

### of()

Tạo Observable từ một chuỗi giá trị

```typescript
import { of } from 'rxjs';

of(1, 2, 3, 4, 5).subscribe((x) => console.log(x));

of({ name: 'John', age: 30 }).subscribe((user) => console.log(user));
```

### from()

Chuyển đổi Array, Promise, hoặc Iterable thành Observable

```typescript
import { from } from 'rxjs';

from([10, 20, 30]).subscribe((x) => console.log(x));

from(fetch('https://api.example.com/data')).subscribe((response) => console.log(response));

from(Promise.resolve('Hello')).subscribe((x) => console.log(x));
```

### interval()

Emit số tăng dần theo khoảng thời gian

```typescript
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

interval(1000)
	.pipe(take(5))
	.subscribe((x) => console.log(x));
```

### timer()

Emit sau một khoảng delay, có thể lặp lại

```typescript
import { timer } from 'rxjs';

timer(3000).subscribe(() => console.log('After 3 seconds'));

timer(1000, 2000)
	.pipe(take(5))
	.subscribe((x) => console.log(x));
```

### fromEvent()

Tạo Observable từ DOM events

```typescript
import { fromEvent } from 'rxjs';

const clicks$ = fromEvent(document, 'click');
clicks$.subscribe((event) => console.log('Clicked:', event));

const button = document.getElementById('myButton');
fromEvent(button, 'click').subscribe(() => {
	console.log('Button clicked!');
});
```

### range()

Emit một dãy số liên tiếp

```typescript
import { range } from 'rxjs';

range(1, 10).subscribe((x) => console.log(x));
```

### ajax()

Thực hiện HTTP requests

```typescript
import { ajax } from 'rxjs/ajax';

ajax.getJSON('https://api.github.com/users/github').subscribe(
	(user) => console.log(user),
	(error) => console.error(error),
);

ajax({
	url: 'https://api.example.com/users',
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: { name: 'John', age: 30 },
}).subscribe((response) => console.log(response));
```

### defer()

Tạo Observable mới cho mỗi subscriber

```typescript
import { defer, of } from 'rxjs';

const random$ = defer(() => of(Math.random()));

random$.subscribe((x) => console.log('Sub 1:', x));
random$.subscribe((x) => console.log('Sub 2:', x));
```

---

## Transformation Operators

### map()

Transform mỗi giá trị được emit

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

of(1, 2, 3, 4)
	.pipe(map((x) => x * 10))
	.subscribe((x) => console.log(x));

of({ price: 100 }, { price: 200 })
	.pipe(map((item) => item.price * 1.1))
	.subscribe((price) => console.log(price));
```

### mergeMap() (flatMap)

Map mỗi giá trị thành Observable rồi merge tất cả vào một luồng, không đợi Observable trước complete

```typescript
import { of, interval } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

of('a', 'b', 'c')
	.pipe(
		mergeMap((letter) =>
			interval(1000).pipe(
				take(3),
				map((i) => `${letter}${i}`),
			),
		),
	)
	.subscribe((x) => console.log(x));

const userIds$ = of(1, 2, 3);
userIds$
	.pipe(mergeMap((id) => ajax.getJSON(`https://api.example.com/users/${id}`)))
	.subscribe((user) => console.log(user));
```

### switchMap()

Map thành Observable mới, hủy Observable trước nếu có giá trị mới (dùng cho search, autocomplete)

```typescript
import { fromEvent } from 'rxjs';
import { switchMap, debounceTime, map } from 'rxjs/operators';

const searchBox = document.getElementById('search');
fromEvent(searchBox, 'input')
	.pipe(
		debounceTime(300),
		map((event) => event.target.value),
		switchMap((searchTerm) => ajax.getJSON(`https://api.example.com/search?q=${searchTerm}`)),
	)
	.subscribe((results) => console.log(results));
```

### concatMap()

Map thành Observable và chờ Observable trước complete mới process tiếp (giữ thứ tự)

```typescript
import { of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';

of(1, 2, 3)
	.pipe(concatMap((x) => of(x).pipe(delay(1000))))
	.subscribe((x) => console.log(x));

const saveRequests$ = of({ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' });
saveRequests$
	.pipe(concatMap((user) => ajax.post('https://api.example.com/users', user)))
	.subscribe((response) => console.log(response));
```

### exhaustMap()

Map thành Observable nhưng bỏ qua các giá trị mới cho đến khi Observable hiện tại complete (dùng cho login, submit form)

```typescript
import { fromEvent } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

const loginButton = document.getElementById('loginBtn');
fromEvent(loginButton, 'click')
	.pipe(exhaustMap(() => ajax.post('https://api.example.com/login', credentials)))
	.subscribe((response) => console.log(response));
```

### scan()

Apply accumulator function, emit mỗi kết quả trung gian (giống reduce nhưng emit mọi step)

```typescript
import { of } from 'rxjs';
import { scan } from 'rxjs/operators';

of(1, 2, 3, 4, 5)
	.pipe(scan((acc, curr) => acc + curr, 0))
	.subscribe((sum) => console.log('Running total:', sum));

const clicks$ = fromEvent(document, 'click');
clicks$.pipe(scan((count) => count + 1, 0)).subscribe((count) => console.log(`Clicked ${count} times`));
```

### pluck()

Extract một property từ object (deprecated trong v8, dùng map thay thế)

```typescript
import { of } from 'rxjs';
import { pluck } from 'rxjs/operators';

of({ name: 'John', age: 30 }, { name: 'Jane', age: 25 })
	.pipe(pluck('name'))
	.subscribe((name) => console.log(name));
```

### buffer()

Collect tất cả giá trị cho đến khi Observable khác emit

```typescript
import { interval, fromEvent } from 'rxjs';
import { buffer } from 'rxjs/operators';

const clicks$ = fromEvent(document, 'click');
interval(1000)
	.pipe(buffer(clicks$))
	.subscribe((values) => console.log(values));
```

### bufferTime()

Collect giá trị trong khoảng thời gian

```typescript
import { interval } from 'rxjs';
import { bufferTime } from 'rxjs/operators';

interval(100)
	.pipe(bufferTime(1000))
	.subscribe((values) => console.log(values));
```

### pairwise()

Emit cặp giá trị hiện tại và trước đó

```typescript
import { fromEvent } from 'rxjs';
import { pairwise, map } from 'rxjs/operators';

fromEvent(document, 'mousemove')
	.pipe(
		pairwise(),
		map(([prev, curr]) => ({
			x: curr.clientX - prev.clientX,
			y: curr.clientY - prev.clientY,
		})),
	)
	.subscribe((diff) => console.log('Mouse moved:', diff));
```

---

## Filtering Operators

### filter()

Emit các giá trị thỏa điều kiện

```typescript
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';

of(1, 2, 3, 4, 5, 6)
	.pipe(filter((x) => x % 2 === 0))
	.subscribe((x) => console.log(x));

interface User {
	name: string;
	age: number;
}
of<User>({ name: 'John', age: 17 }, { name: 'Jane', age: 25 })
	.pipe(filter((user) => user.age >= 18))
	.subscribe((user) => console.log(user));
```

### take()

Lấy n giá trị đầu tiên rồi complete

```typescript
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

interval(1000)
	.pipe(take(5))
	.subscribe((x) => console.log(x));
```

### takeWhile()

Lấy giá trị cho đến khi điều kiện false

```typescript
import { of } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

of(1, 2, 3, 4, 5, 1, 2)
	.pipe(takeWhile((x) => x < 4))
	.subscribe((x) => console.log(x));
```

### takeUntil()

Lấy giá trị cho đến khi Observable khác emit (dùng để unsubscribe)

```typescript
import { interval, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const clicks$ = fromEvent(document, 'click');
interval(1000)
	.pipe(takeUntil(clicks$))
	.subscribe((x) => console.log(x));

class MyComponent {
	private destroy$ = new Subject<void>();

	ngOnInit() {
		interval(1000)
			.pipe(takeUntil(this.destroy$))
			.subscribe((x) => console.log(x));
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
```

### skip()

Bỏ qua n giá trị đầu tiên

```typescript
import { of } from 'rxjs';
import { skip } from 'rxjs/operators';

of(1, 2, 3, 4, 5)
	.pipe(skip(2))
	.subscribe((x) => console.log(x));
```

### debounceTime()

Emit giá trị chỉ khi đã im lặng một khoảng thời gian (dùng cho search input)

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

const searchInput = document.getElementById('search');
fromEvent(searchInput, 'input')
	.pipe(
		debounceTime(300),
		map((event) => event.target.value),
	)
	.subscribe((searchTerm) => console.log('Search:', searchTerm));
```

### throttleTime()

Emit giá trị đầu tiên rồi ignore các giá trị khác trong khoảng thời gian

```typescript
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

fromEvent(document, 'click')
	.pipe(throttleTime(1000))
	.subscribe(() => console.log('Clicked'));

fromEvent(window, 'resize')
	.pipe(throttleTime(500))
	.subscribe(() => console.log('Resized'));
```

### distinctUntilChanged()

Emit giá trị chỉ khi khác với giá trị trước

```typescript
import { of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

of(1, 1, 2, 2, 2, 3, 3, 1)
	.pipe(distinctUntilChanged())
	.subscribe((x) => console.log(x));

of({ name: 'John' }, { name: 'John' }, { name: 'Jane' })
	.pipe(distinctUntilChanged((prev, curr) => prev.name === curr.name))
	.subscribe((user) => console.log(user));
```

### distinctUntilKeyChanged()

Emit object chỉ khi property cụ thể thay đổi

```typescript
import { of } from 'rxjs';
import { distinctUntilKeyChanged } from 'rxjs/operators';

of({ id: 1, name: 'John' }, { id: 1, name: 'Jane' }, { id: 2, name: 'Jane' })
	.pipe(distinctUntilKeyChanged('id'))
	.subscribe((user) => console.log(user));
```

### first()

Emit giá trị đầu tiên (hoặc giá trị đầu tiên thỏa điều kiện)

```typescript
import { of } from 'rxjs';
import { first } from 'rxjs/operators';

of(1, 2, 3, 4)
	.pipe(first())
	.subscribe((x) => console.log(x));

of(1, 2, 3, 4)
	.pipe(first((x) => x > 2))
	.subscribe((x) => console.log(x));
```

### last()

Emit giá trị cuối cùng

```typescript
import { of } from 'rxjs';
import { last } from 'rxjs/operators';

of(1, 2, 3, 4)
	.pipe(last())
	.subscribe((x) => console.log(x));
```

---

## Combination Operators

### combineLatest()

Combine nhiều Observables, emit array khi bất kỳ Observable nào emit (sau khi tất cả đã emit ít nhất 1 lần)

```typescript
import { combineLatest, of, timer } from 'rxjs';

const weight$ = of(70, 72, 76);
const height$ = of(1.76, 1.77, 1.78);

combineLatest([weight$, height$]).subscribe(([weight, height]) => console.log('BMI:', weight / height ** 2));

const age$ = of(25, 30);
const name$ = of('John', 'Jane');
combineLatest({ age: age$, name: name$ }).subscribe((obj) => console.log(obj));
```

### merge()

Merge nhiều Observables thành một, emit khi bất kỳ Observable nào emit

```typescript
import { merge, fromEvent, interval } from 'rxjs';
import { map } from 'rxjs/operators';

const clicks$ = fromEvent(document, 'click').pipe(map(() => 'click'));
const interval$ = interval(1000).pipe(map(() => 'interval'));

merge(clicks$, interval$).subscribe((x) => console.log(x));
```

### concat()

Subscribe Observables tuần tự, chờ Observable trước complete

```typescript
import { concat, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const first$ = of(1, 2, 3).pipe(delay(1000));
const second$ = of(4, 5, 6);

concat(first$, second$).subscribe((x) => console.log(x));
```

### zip()

Combine nhiều Observables, emit array khi tất cả đã emit giá trị tại cùng index

```typescript
import { zip, of } from 'rxjs';

const age$ = of(27, 25, 29);
const name$ = of('Foo', 'Bar', 'Baz');
const isDev$ = of(true, true, false);

zip(age$, name$, isDev$).subscribe(([age, name, isDev]) => console.log({ age, name, isDev }));
```

### forkJoin()

Chờ tất cả Observables complete rồi emit giá trị cuối cùng của mỗi Observable (giống Promise.all)

```typescript
import { forkJoin, of } from 'rxjs';
import { delay } from 'rxjs/operators';

forkJoin({
	users: ajax.getJSON('https://api.example.com/users'),
	posts: ajax.getJSON('https://api.example.com/posts'),
	comments: ajax.getJSON('https://api.example.com/comments'),
}).subscribe(({ users, posts, comments }) => {
	console.log('All loaded:', users, posts, comments);
});

const fetchUser = (id: number) => of({ id, name: `User ${id}` }).pipe(delay(1000));
forkJoin([fetchUser(1), fetchUser(2), fetchUser(3)]).subscribe((users) => console.log('All users:', users));
```

### withLatestFrom()

Combine với giá trị mới nhất từ Observable khác khi source emit

```typescript
import { fromEvent, interval } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

const clicks$ = fromEvent(document, 'click');
const timer$ = interval(1000);

clicks$.pipe(withLatestFrom(timer$)).subscribe(([click, time]) => console.log('Clicked at:', time));
```

### startWith()

Emit giá trị ban đầu trước khi Observable bắt đầu

```typescript
import { of } from 'rxjs';
import { startWith } from 'rxjs/operators';

of(1, 2, 3)
	.pipe(startWith(0))
	.subscribe((x) => console.log(x));

of('Hello')
	.pipe(startWith('Starting...', 'Loading...'))
	.subscribe((x) => console.log(x));
```

### endWith()

Emit giá trị cuối cùng sau khi Observable complete

```typescript
import { of } from 'rxjs';
import { endWith } from 'rxjs/operators';

of(1, 2, 3)
	.pipe(endWith(4, 5, 6))
	.subscribe((x) => console.log(x));
```

---

## Error Handling

### catchError()

Catch error và return Observable mới

```typescript
import { of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

of(1, 2, 3, 4, 5)
	.pipe(
		map((n) => {
			if (n === 4) throw 'Four!';
			return n;
		}),
		catchError((err) => of('Error caught:', err)),
	)
	.subscribe((x) => console.log(x));

ajax
	.getJSON('https://api.example.com/data')
	.pipe(
		catchError((error) => {
			console.error('Request failed:', error);
			return of({ data: [] });
		}),
	)
	.subscribe((result) => console.log(result));
```

### retry()

Retry khi có error

```typescript
import { of } from 'rxjs';
import { retry, tap } from 'rxjs/operators';

let count = 0;
const source$ = new Observable((subscriber) => {
	count++;
	if (count < 3) {
		subscriber.error('Failed');
	} else {
		subscriber.next('Success');
		subscriber.complete();
	}
});

source$
	.pipe(
		retry(2),
		catchError((err) => of('Final error:', err)),
	)
	.subscribe((x) => console.log(x));

ajax
	.getJSON('https://api.example.com/data')
	.pipe(
		retry(3),
		catchError((err) => of({ error: 'Failed after 3 retries' })),
	)
	.subscribe((result) => console.log(result));
```

### retryWhen()

Retry với logic custom

```typescript
import { timer, throwError } from 'rxjs';
import { retryWhen, delayWhen, tap, take } from 'rxjs/operators';

throwError('Error!')
	.pipe(
		retryWhen((errors) =>
			errors.pipe(
				tap((err) => console.log('Retrying...', err)),
				delayWhen(() => timer(1000)),
				take(3),
			),
		),
		catchError((err) => of('Final fail')),
	)
	.subscribe((x) => console.log(x));
```

### throwError()

Tạo Observable emit error ngay lập tức

```typescript
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

throwError(() => new Error('This is an error!'))
	.pipe(
		catchError((err) => {
			console.error('Caught:', err.message);
			return of('Recovered');
		}),
	)
	.subscribe((x) => console.log(x));
```

---

## Utility Operators

### tap()

Thực hiện side effects mà không ảnh hưởng giá trị (dùng cho logging, debugging)

```typescript
import { of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

of(1, 2, 3, 4, 5)
	.pipe(
		tap((x) => console.log('Before:', x)),
		map((x) => x * 10),
		tap((x) => console.log('After:', x)),
	)
	.subscribe((x) => console.log('Final:', x));

ajax
	.getJSON('https://api.example.com/users')
	.pipe(
		tap((users) => console.log('Fetched users:', users.length)),
		map((users) => users.filter((u) => u.active)),
		tap((users) => console.log('Active users:', users.length)),
	)
	.subscribe((users) => console.log(users));
```

### delay()

Delay mỗi emission một khoảng thời gian

```typescript
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

of('Hello', 'World')
	.pipe(delay(1000))
	.subscribe((x) => console.log(x));
```

### delayWhen()

Delay emission dựa theo Observable khác

```typescript
import { of, timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';

of(1, 2, 3)
	.pipe(delayWhen((x) => timer(x * 1000)))
	.subscribe((x) => console.log(x));
```

### timeout()

Emit error nếu không nhận giá trị trong khoảng thời gian

```typescript
import { of } from 'rxjs';
import { delay, timeout, catchError } from 'rxjs/operators';

of('data')
	.pipe(
		delay(2000),
		timeout(1000),
		catchError((err) => of('Timeout!')),
	)
	.subscribe((x) => console.log(x));
```

### finalize()

Thực hiện logic khi Observable complete hoặc error

```typescript
import { of } from 'rxjs';
import { finalize, delay } from 'rxjs/operators';

of(1, 2, 3)
	.pipe(
		delay(1000),
		finalize(() => console.log('Stream completed')),
	)
	.subscribe((x) => console.log(x));
```

### share()

Share một subscription giữa nhiều subscribers (multicast)

```typescript
import { interval } from 'rxjs';
import { share, take } from 'rxjs/operators';

const shared$ = interval(1000).pipe(take(5), share());

shared$.subscribe((x) => console.log('Sub 1:', x));
setTimeout(() => {
	shared$.subscribe((x) => console.log('Sub 2:', x));
}, 2000);
```

### shareReplay()

Share và replay n giá trị gần nhất cho subscribers mới

```typescript
import { interval } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';

const shared$ = interval(1000).pipe(take(5), shareReplay(2));

shared$.subscribe((x) => console.log('Sub 1:', x));
setTimeout(() => {
	shared$.subscribe((x) => console.log('Sub 2:', x));
}, 3000);

const cachedData$ = ajax.getJSON('https://api.example.com/data').pipe(shareReplay(1));
```

---

## Subjects

### Subject

Vừa là Observable vừa là Observer, có thể multicast

```typescript
import { Subject } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe((x) => console.log('Observer A:', x));
subject.subscribe((x) => console.log('Observer B:', x));

subject.next(1);
subject.next(2);

subject.subscribe((x) => console.log('Observer C:', x));

subject.next(3);
```

### BehaviorSubject

Subject có giá trị ban đầu và emit giá trị mới nhất cho subscriber mới

```typescript
import { BehaviorSubject } from 'rxjs';

const subject = new BehaviorSubject<number>(0);

subject.subscribe((x) => console.log('Observer A:', x));

subject.next(1);
subject.next(2);

subject.subscribe((x) => console.log('Observer B:', x));

subject.next(3);

console.log('Current value:', subject.value);

class StateService {
	private userSubject = new BehaviorSubject<User | null>(null);
	user$ = this.userSubject.asObservable();

	setUser(user: User) {
		this.userSubject.next(user);
	}

	getCurrentUser(): User | null {
		return this.userSubject.value;
	}
}
```

### ReplaySubject

Subject buffer n giá trị và replay cho subscriber mới

```typescript
import { ReplaySubject } from 'rxjs';

const subject = new ReplaySubject<number>(3);

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe((x) => console.log('Observer A:', x));

subject.next(5);

subject.subscribe((x) => console.log('Observer B:', x));

const recentMessages = new ReplaySubject<string>(100);
```

### AsyncSubject

Subject chỉ emit giá trị cuối cùng khi complete

```typescript
import { AsyncSubject } from 'rxjs';

const subject = new AsyncSubject<number>();

subject.subscribe((x) => console.log('Observer A:', x));

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe((x) => console.log('Observer B:', x));

subject.next(5);
subject.complete();
```

---

## Use Cases Thực Tế

### 1. Auto-complete Search

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, filter, catchError } from 'rxjs/operators';

const searchInput = document.getElementById('search-input') as HTMLInputElement;
const resultsList = document.getElementById('results');

const search$ = fromEvent(searchInput, 'input').pipe(
	map((event) => (event.target as HTMLInputElement).value),
	filter((term) => term.length >= 2),
	debounceTime(300),
	distinctUntilChanged(),
	switchMap((term) =>
		ajax.getJSON(`https://api.example.com/search?q=${term}`).pipe(
			catchError((err) => {
				console.error('Search error:', err);
				return of([]);
			}),
		),
	),
);

search$.subscribe((results) => {
	resultsList.innerHTML = results.map((r) => `<li>${r.name}</li>`).join('');
});
```

### 2. Form Validation

```typescript
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

class FormValidator {
	private emailSubject = new BehaviorSubject<string>('');
	private passwordSubject = new BehaviorSubject<string>('');

	email$ = this.emailSubject.asObservable();
	password$ = this.passwordSubject.asObservable();

	emailValid$ = this.email$.pipe(
		map((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
		distinctUntilChanged(),
	);

	passwordValid$ = this.password$.pipe(
		map((pwd) => pwd.length >= 8),
		distinctUntilChanged(),
	);

	formValid$ = combineLatest([this.emailValid$, this.passwordValid$]).pipe(
		map(([emailValid, passwordValid]) => emailValid && passwordValid),
	);

	setEmail(email: string) {
		this.emailSubject.next(email);
	}

	setPassword(password: string) {
		this.passwordSubject.next(password);
	}
}

const validator = new FormValidator();

validator.formValid$.subscribe((isValid) => {
	const submitBtn = document.getElementById('submit');
	submitBtn.disabled = !isValid;
});

const emailInput = document.getElementById('email');
fromEvent(emailInput, 'input')
	.pipe(map((e) => e.target.value))
	.subscribe((email) => validator.setEmail(email));

const passwordInput = document.getElementById('password');
fromEvent(passwordInput, 'input')
	.pipe(map((e) => e.target.value))
	.subscribe((pwd) => validator.setPassword(pwd));
```

### 3. Infinite Scroll

```typescript
import { fromEvent } from 'rxjs';
import { throttleTime, map, filter, exhaustMap, scan, tap } from 'rxjs/operators';

interface Page {
	items: any[];
	page: number;
}

const scroll$ = fromEvent(window, 'scroll').pipe(
	throttleTime(200),
	map(() => ({
		scrollHeight: document.documentElement.scrollHeight,
		scrollTop: document.documentElement.scrollTop,
		clientHeight: document.documentElement.clientHeight,
	})),
	filter(({ scrollHeight, scrollTop, clientHeight }) => scrollTop + clientHeight >= scrollHeight - 100),
);

const loadMore$ = scroll$.pipe(
	scan((page) => page + 1, 1),
	exhaustMap((page) =>
		ajax.getJSON<any[]>(`https://api.example.com/items?page=${page}`).pipe(map((items) => ({ items, page }))),
	),
);

loadMore$.subscribe(({ items, page }) => {
	console.log(`Loaded page ${page}:`, items);
	appendItemsToDOM(items);
});
```

### 4. Drag and Drop

```typescript
import { fromEvent, merge } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';

const element = document.getElementById('draggable');

const mouseDown$ = fromEvent<MouseEvent>(element, 'mousedown');
const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove');
const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup');

const drag$ = mouseDown$.pipe(
	tap((e) => e.preventDefault()),
	switchMap((start) => {
		const startX = start.clientX - element.offsetLeft;
		const startY = start.clientY - element.offsetTop;

		return mouseMove$.pipe(
			map((move) => ({
				x: move.clientX - startX,
				y: move.clientY - startY,
			})),
			takeUntil(mouseUp$),
		);
	}),
);

drag$.subscribe(({ x, y }) => {
	element.style.left = `${x}px`;
	element.style.top = `${y}px`;
});
```

### 5. WebSocket với Auto-reconnect

```typescript
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { retryWhen, delay, tap } from 'rxjs/operators';

class WebSocketService {
	private socket$: WebSocketSubject<any>;

	connect(url: string) {
		this.socket$ = webSocket({
			url,
			openObserver: {
				next: () => console.log('WebSocket connected'),
			},
			closeObserver: {
				next: () => console.log('WebSocket disconnected'),
			},
		});

		return this.socket$.pipe(
			retryWhen((errors) =>
				errors.pipe(
					tap((err) => console.error('WebSocket error:', err)),
					delay(5000),
					tap(() => console.log('Reconnecting...')),
				),
			),
		);
	}

	send(message: any) {
		this.socket$.next(message);
	}
}

const wsService = new WebSocketService();
wsService.connect('wss://api.example.com/ws').subscribe(
	(message) => console.log('Received:', message),
	(error) => console.error('Error:', error),
);

wsService.send({ type: 'subscribe', channel: 'updates' });
```

### 6. Polling với exponential backoff

```typescript
import { timer, defer, throwError } from 'rxjs';
import { switchMap, retryWhen, scan, delayWhen, tap } from 'rxjs/operators';

const poll$ = timer(0, 5000).pipe(
	switchMap(() =>
		ajax.getJSON('https://api.example.com/status').pipe(
			retryWhen((errors) =>
				errors.pipe(
					scan((retryCount, err) => {
						if (retryCount >= 5) throw err;
						return retryCount + 1;
					}, 0),
					tap((retryCount) => console.log(`Retry attempt: ${retryCount}`)),
					delayWhen((retryCount) => timer(Math.pow(2, retryCount) * 1000)),
				),
			),
		),
	),
);

poll$.subscribe(
	(status) => console.log('Status:', status),
	(error) => console.error('Polling failed:', error),
);
```

### 7. Caching với shareReplay

```typescript
import { shareReplay, map } from 'rxjs/operators';

class DataService {
	private cache$ = new Map<string, Observable<any>>();

	getData(key: string): Observable<any> {
		if (!this.cache$.has(key)) {
			const request$ = ajax.getJSON(`https://api.example.com/data/${key}`).pipe(shareReplay(1));
			this.cache$.set(key, request$);
		}
		return this.cache$.get(key)!;
	}

	clearCache(key?: string) {
		if (key) {
			this.cache$.delete(key);
		} else {
			this.cache$.clear();
		}
	}
}

const service = new DataService();

service.getData('users').subscribe((users) => console.log('First call:', users));
service.getData('users').subscribe((users) => console.log('Cached:', users));
```

### 8. Progress Bar cho Multiple Requests

```typescript
import { forkJoin, BehaviorSubject, merge } from 'rxjs';
import { map, tap, finalize } from 'rxjs/operators';

class ProgressService {
	private progressSubject = new BehaviorSubject<number>(0);
	progress$ = this.progressSubject.asObservable();

	loadMultipleResources(urls: string[]) {
		let completed = 0;
		const total = urls.length;

		const requests = urls.map((url) =>
			ajax.getJSON(url).pipe(
				tap(() => {
					completed++;
					this.progressSubject.next((completed / total) * 100);
				}),
			),
		);

		return forkJoin(requests).pipe(finalize(() => this.progressSubject.next(0)));
	}
}

const progressService = new ProgressService();

progressService.progress$.subscribe((progress) => console.log(`Progress: ${progress}%`));

progressService
	.loadMultipleResources([
		'https://api.example.com/data1',
		'https://api.example.com/data2',
		'https://api.example.com/data3',
	])
	.subscribe((results) => console.log('All loaded:', results));
```

### 9. Undo/Redo với scan

```typescript
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';

interface Action {
	type: 'ADD' | 'UNDO' | 'REDO';
	payload?: any;
}

interface State {
	present: any[];
	past: any[][];
	future: any[][];
}

const actions$ = new Subject<Action>();

const state$ = actions$.pipe(
	scan(
		(state: State, action: Action) => {
			switch (action.type) {
				case 'ADD':
					return {
						present: [...state.present, action.payload],
						past: [...state.past, state.present],
						future: [],
					};

				case 'UNDO':
					if (state.past.length === 0) return state;
					const previous = state.past[state.past.length - 1];
					return {
						present: previous,
						past: state.past.slice(0, -1),
						future: [state.present, ...state.future],
					};

				case 'REDO':
					if (state.future.length === 0) return state;
					const next = state.future[0];
					return {
						present: next,
						past: [...state.past, state.present],
						future: state.future.slice(1),
					};

				default:
					return state;
			}
		},
		{ present: [], past: [], future: [] },
	),
);

state$.subscribe((state) => console.log('Current state:', state));

actions$.next({ type: 'ADD', payload: 'Item 1' });
actions$.next({ type: 'ADD', payload: 'Item 2' });
actions$.next({ type: 'UNDO' });
actions$.next({ type: 'REDO' });
```

### 10. Rate Limiting

```typescript
import { fromEvent, timer } from 'rxjs';
import { buffer, filter, map, tap, throttleTime } from 'rxjs/operators';

const button = document.getElementById('api-button');
const clicks$ = fromEvent(button, 'click');

const rateLimitedClicks$ = clicks$.pipe(
	throttleTime(1000),
	tap(() => console.log('API call allowed')),
);

rateLimitedClicks$.subscribe(() => {
	ajax.post('https://api.example.com/action', { data: 'value' }).subscribe((response) => console.log(response));
});

const detectSpam$ = clicks$.pipe(
	buffer(timer(1000)),
	filter((clicks) => clicks.length > 5),
	tap(() => console.warn('Too many clicks detected!')),
);

detectSpam$.subscribe();
```

---

## Best Practices

### 1. Unsubscribe để tránh memory leaks

```typescript
import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

class MyComponent implements OnDestroy {
	private destroy$ = new Subject<void>();

	ngOnInit() {
		interval(1000)
			.pipe(takeUntil(this.destroy$))
			.subscribe((x) => console.log(x));

		fromEvent(window, 'resize')
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => console.log('Resized'));
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
```

### 2. Sử dụng async pipe trong Angular

```typescript
@Component({
	selector: 'app-users',
	template: `
		<div *ngFor="let user of users$ | async">
			{{ user.name }}
		</div>
	`,
})
class UsersComponent {
	users$ = this.http.get<User[]>('https://api.example.com/users');

	constructor(private http: HttpClient) {}
}
```

### 3. Error handling tốt

```typescript
const safeRequest$ = ajax.getJSON('https://api.example.com/data').pipe(
	retry(3),
	catchError((error) => {
		console.error('Request failed:', error);
		return of({ data: [], error: true });
	}),
	finalize(() => console.log('Request completed')),
);
```

### 4. Tránh nested subscriptions

```typescript
source1$
	.pipe(switchMap((result1) => source2$.pipe(map((result2) => ({ result1, result2 })))))
	.subscribe(({ result1, result2 }) => {
		console.log(result1, result2);
	});
```

### 5. Sử dụng shareReplay cho HTTP caching

```typescript
class DataService {
	users$ = this.http.get<User[]>('https://api.example.com/users').pipe(shareReplay(1));
}
```

---

## Kết luận

RxJS 7 cung cấp công cụ mạnh mẽ để xử lý lập trình bất đồng bộ và reactive. Các operators phổ biến nhất bao gồm:

**Creation**: `of`, `from`, `interval`, `fromEvent`, `ajax`

**Transformation**: `map`, `mergeMap`, `switchMap`, `concatMap`, `scan`

**Filtering**: `filter`, `debounceTime`, `throttleTime`, `distinctUntilChanged`, `take`, `takeUntil`

**Combination**: `combineLatest`, `forkJoin`, `merge`, `withLatestFrom`

**Error Handling**: `catchError`, `retry`, `retryWhen`

**Utility**: `tap`, `delay`, `shareReplay`, `finalize`

Hãy chọn operator phù hợp với use case của bạn và luôn nhớ unsubscribe để tránh memory leaks!
