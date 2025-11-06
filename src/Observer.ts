type NextHandler<T> = (value?: T) => void;
type ErrorHandler<E> = (error: E) => void;
type CompleteHandler<C> = (complete?: C) => void;

export interface ObserverConfig<T = any, E = any, C = any> {
	next: NextHandler<T>;
	error?: ErrorHandler<E>;
	complete?: CompleteHandler<C>;
}

export class Observer<T = any, E = any, C = any> {
	public readonly next: NextHandler<T>;
	public readonly error: ErrorHandler<E>;
	public readonly complete: CompleteHandler<C>;

	constructor(next: NextHandler<T>, error?: ErrorHandler<E>, complete?: CompleteHandler<C>);
	constructor(config: ObserverConfig<T, E, C>);
	constructor(
		nextOrConfig: NextHandler<T> | ObserverConfig<T, E, C>,
		error?: ErrorHandler<E>,
		complete?: CompleteHandler<C>,
	) {
		if (typeof nextOrConfig === 'function') {
			this.next = nextOrConfig;
			this.error = error ?? (() => {});
			this.complete = complete ?? (() => {});
		} else {
			this.next = nextOrConfig.next;
			this.error = nextOrConfig.error ?? (() => {});
			this.complete = nextOrConfig.complete ?? (() => {});
		}
	}
}
