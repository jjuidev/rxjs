# RxJS - Học Observable Pattern

Dự án tự implement lại các khái niệm cơ bản của RxJS để hiểu rõ hơn về Observable Pattern và Reactive Programming.

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cài đặt](#cài-đặt)
- [Cách sử dụng](#cách-sử-dụng)
- [API Documentation](#api-documentation)
  - [Observable](#observable)
  - [Observer](#observer)
- [Ví dụ](#ví-dụ)
- [Development](#development)
- [License](#license)

## 🎯 Giới thiệu

Dự án này là một implementation đơn giản của Observable Pattern, lấy cảm hứng từ thư viện RxJS. Mục đích chính là học và hiểu sâu về cách hoạt động của Observable, Observer và các pattern reactive programming.

### Các khái niệm chính:

- **Observable**: Đại diện cho một stream dữ liệu có thể phát ra các giá trị theo thời gian
- **Observer**: Object lắng nghe và xử lý các giá trị được phát ra từ Observable
- **Subscribe**: Phương thức để đăng ký nhận dữ liệu từ Observable
- **Unsubscribe**: Hàm để hủy đăng ký và dọn dẹp resources

## 📦 Cài đặt

### Yêu cầu

- Node.js >= 14
- Yarn hoặc npm

### Các bước cài đặt

```bash
# Clone repository
git clone git@github.com-jjuidev:jjuidev/rxjs.git

# Di chuyển vào thư mục dự án
cd rxjs

# Cài đặt dependencies
yarn install
```

## 🚀 Cách sử dụng

### Chạy ở môi trường development

```bash
yarn dev
```

### Build dự án

```bash
yarn build
```

### Chạy file đã build

```bash
yarn start
```

## 📚 API Documentation

### Observable

Class `Observable` đại diện cho một stream dữ liệu bất đồng bộ.

#### Constructor

```typescript
constructor(subscribe: Subscribe<T>)
```

Tạo một Observable mới với hàm subscribe tùy chỉnh.

**Tham số:**

- `subscribe`: Hàm nhận vào một Observer và trả về hàm unsubscribe

**Ví dụ:**

```typescript
import { Observable } from '@/Observable';
import { Observer } from '@/Observer';

const myObservable = new Observable((observer) => {
	observer.next('Hello');
	observer.next('World');
	observer.complete();

	return () => {
		// Cleanup logic
		console.log('Unsubscribed');
	};
});
```

#### Static Methods

##### `Observable.timeout(ms: number)`

Tạo một Observable phát ra một giá trị sau một khoảng thời gian delay, sau đó complete.

**Tham số:**

- `ms`: Thời gian delay tính bằng milliseconds

**Trả về:** `Observable`

**Ví dụ:**

```typescript
const timeout$ = Observable.timeout(1000);

const unsubscribe = timeout$.subscribe(
	new Observer({
		next: () => console.log('Timeout completed!'),
		complete: () => console.log('Done'),
	}),
);
```

##### `Observable.interval(ms: number)`

Tạo một Observable phát ra giá trị liên tục theo một khoảng thời gian cố định.

**Tham số:**

- `ms`: Khoảng thời gian giữa các lần phát giá trị (milliseconds)

**Trả về:** `Observable`

**Lưu ý:** Observable này sẽ phát ra giá trị vô hạn cho đến khi bị unsubscribe.

**Ví dụ:**

```typescript
const interval$ = Observable.interval(1000);

const unsubscribe = interval$.subscribe(
	new Observer({
		next: () => console.log('Tick'),
	}),
);

// Dừng sau 5 giây
setTimeout(() => {
	unsubscribe();
}, 5000);
```

#### Instance Methods

##### `subscribe(observer: Observer<T>)`

Đăng ký một Observer để nhận các giá trị từ Observable.

**Tham số:**

- `observer`: Observer object hoặc Observer instance

**Trả về:** `Unsubscribe` - Hàm để hủy đăng ký

**Ví dụ:**

```typescript
const unsubscribe = myObservable$.subscribe(
	new Observer({
		next: (value) => console.log('Received:', value),
		error: (err) => console.error('Error:', err),
		complete: () => console.log('Complete'),
	}),
);

// Hủy đăng ký khi không cần nữa
unsubscribe();
```

### Observer

Class `Observer` định nghĩa cách xử lý các event từ Observable.

#### Constructor

Observer hỗ trợ 2 cách khởi tạo:

**Cách 1: Sử dụng config object**

```typescript
constructor(config: ObserverConfig<T, E, C>)
```

**Tham số:**

- `config.next`: Hàm xử lý khi nhận được giá trị mới (bắt buộc)
- `config.error`: Hàm xử lý khi có lỗi (tùy chọn)
- `config.complete`: Hàm xử lý khi Observable complete (tùy chọn)

**Ví dụ:**

```typescript
const observer = new Observer({
	next: (value) => console.log('Value:', value),
	error: (err) => console.error('Error:', err),
	complete: () => console.log('Completed'),
});
```

**Cách 2: Sử dụng các tham số riêng biệt**

```typescript
constructor(
  next: NextHandler<T>,
  error?: ErrorHandler<E>,
  complete?: CompleteHandler<C>
)
```

**Tham số:**

- `next`: Hàm xử lý khi nhận được giá trị mới
- `error`: Hàm xử lý khi có lỗi (tùy chọn)
- `complete`: Hàm xử lý khi Observable complete (tùy chọn)

**Ví dụ:**

```typescript
const observer = new Observer(
	(value) => console.log('Value:', value),
	(err) => console.error('Error:', err),
	() => console.log('Completed'),
);
```

#### Properties

- `next`: Hàm callback được gọi khi Observable phát ra giá trị mới
- `error`: Hàm callback được gọi khi Observable gặp lỗi
- `complete`: Hàm callback được gọi khi Observable hoàn thành

## 💡 Ví dụ

### Ví dụ 1: Sử dụng timeout

```typescript
import { Observable } from '@/Observable';
import { Observer } from '@/Observer';

const timeout$ = Observable.timeout(2000);

const unsubscribe = timeout$.subscribe(
	new Observer({
		next: () => {
			console.log('2 giây đã trôi qua!');
		},
		complete: () => {
			console.log('Hoàn thành');
		},
	}),
);

// Có thể hủy bỏ trước khi timeout xảy ra
// unsubscribe();
```

### Ví dụ 2: Sử dụng interval

```typescript
import { Observable } from '@/Observable';
import { Observer } from '@/Observer';

let count = 0;
const interval$ = Observable.interval(1000);

const unsubscribe = interval$.subscribe(
	new Observer({
		next: () => {
			count++;
			console.log(`Tick ${count}`);

			// Dừng sau 5 lần
			if (count >= 5) {
				unsubscribe();
				console.log('Đã dừng interval');
			}
		},
	}),
);
```

### Ví dụ 3: Tạo Observable tùy chỉnh

```typescript
import { Observable } from '@/Observable';
import { Observer } from '@/Observer';

// Observable phát ra các số từ 1 đến 5
const counter$ = new Observable((observer) => {
	let count = 1;

	const intervalId = setInterval(() => {
		if (count <= 5) {
			observer.next(count++);
		} else {
			observer.complete();
			clearInterval(intervalId);
		}
	}, 500);

	// Cleanup function
	return () => {
		clearInterval(intervalId);
		console.log('Cleaned up!');
	};
});

const unsubscribe = counter$.subscribe(
	new Observer({
		next: (value) => console.log('Số:', value),
		complete: () => console.log('Đếm xong!'),
	}),
);
```

### Ví dụ 4: Xử lý lỗi

```typescript
import { Observable } from '@/Observable';
import { Observer } from '@/Observer';

const errorObservable$ = new Observable((observer) => {
	setTimeout(() => {
		observer.next('Bắt đầu xử lý...');
	}, 1000);

	setTimeout(() => {
		// Giả lập một lỗi
		observer.error(new Error('Đã xảy ra lỗi!'));
	}, 2000);

	return () => {
		console.log('Cleanup');
	};
});

const unsubscribe = errorObservable$.subscribe(
	new Observer({
		next: (value) => console.log('Nhận:', value),
		error: (err) => console.error('Lỗi:', err.message),
		complete: () => console.log('Hoàn thành'),
	}),
);
```

## 🛠 Development

### Cấu trúc dự án

```
rxjs/
├── src/
│   ├── Observable.ts    # Class Observable chính
│   ├── Observer.ts      # Class Observer để xử lý events
│   └── main.ts          # File demo/test
├── dist/                # Build output
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts có sẵn

- `yarn dev`: Chạy dự án ở chế độ development với hot reload
- `yarn build`: Build dự án TypeScript thành JavaScript
- `yarn start`: Chạy file JavaScript đã build
- `yarn format`: Format code với ESLint và Prettier

### Coding Standards

Dự án sử dụng:

- **TypeScript** cho type safety
- **ESLint** để kiểm tra code quality
- **Prettier** để format code
- **Husky** để chạy pre-commit hooks
- **Commitlint** để đảm bảo commit message format

### Path Aliases

Dự án cấu hình path alias `@/*` trỏ đến thư mục `src/`:

```typescript
// Thay vì
import { Observable } from '../Observable';

// Có thể dùng
import { Observable } from '@/Observable';
```

## 📝 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 👤 Author

**jjuidev**

- Email: jjuidev@gmail.com
- GitHub: [@jjuidev](https://github.com/jjuidev)

---

**Note:** Đây là dự án học tập, không nên sử dụng trong production. Để sử dụng trong dự án thực tế, hãy dùng thư viện [RxJS](https://rxjs.dev/) chính thức.
