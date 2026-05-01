//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
var dev_fallback_default = !"production".toLowerCase().startsWith("prod");
//#endregion
//#region node_modules/svelte/src/internal/shared/utils.js
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
var noop = () => {};
/** @param {Array<() => void>} arr */
function run_all(arr) {
	for (var i = 0; i < arr.length; i++) arr[i]();
}
/**
* TODO replace with Promise.withResolvers once supported widely enough
* @template [T=void]
*/
function deferred() {
	/** @type {(value: T) => void} */
	var resolve;
	/** @type {(reason: any) => void} */
	var reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
var CLEAN = 1024;
var DIRTY = 2048;
var MAYBE_DIRTY = 4096;
var INERT = 8192;
var DESTROYED = 16384;
/** Set once a reaction has run for the first time */
var REACTION_RAN = 32768;
/** Effect is in the process of getting destroyed. Can be observed in child teardown functions */
var DESTROYING = 1 << 25;
/**
* 'Transparent' effects do not create a transition boundary.
* This is on a block effect 99% of the time but may also be on a branch effect if its parent block effect was pruned
*/
var EFFECT_TRANSPARENT = 65536;
var EFFECT_PRESERVED = 1 << 19;
var USER_EFFECT = 1 << 20;
var EFFECT_OFFSCREEN = 1 << 25;
/**
* Tells that we marked this derived and its reactions as visited during the "mark as (maybe) dirty"-phase.
* Will be lifted during execution of the derived and during checking its dirty state (both are necessary
* because a derived might be checked but not executed).
*/
var WAS_MARKED = 65536;
var REACTION_IS_UPDATING = 1 << 21;
var ASYNC = 1 << 22;
var ERROR_VALUE = 1 << 23;
var STATE_SYMBOL = Symbol("$state");
var LEGACY_PROPS = Symbol("legacy props");
var LOADING_ATTR_SYMBOL = Symbol("");
var PROXY_PATH_SYMBOL = Symbol("proxy path");
/** An anchor might change, via this symbol on the original anchor we can tell HMR about the updated anchor */
var HMR_ANCHOR = Symbol("hmr anchor");
/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
var STALE_REACTION = new class StaleReactionError extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
var IS_XHTML = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
//#endregion
//#region node_modules/svelte/src/internal/shared/errors.js
/**
* An invariant violation occurred, meaning Svelte's internal assumptions were flawed. This is a bug in Svelte, not your app — please open an issue at https://github.com/sveltejs/svelte, citing the following message: "%message%"
* @param {string} message
* @returns {never}
*/
function invariant_violation(message) {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`invariant_violation\nAn invariant violation occurred, meaning Svelte's internal assumptions were flawed. This is a bug in Svelte, not your app — please open an issue at https://github.com/sveltejs/svelte, citing the following message: "${message}"\nhttps://svelte.dev/e/invariant_violation`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/invariant_violation`);
}
/**
* `%name%(...)` can only be used during component initialisation
* @param {string} name
* @returns {never}
*/
function lifecycle_outside_component(name) {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`lifecycle_outside_component\n\`${name}(...)\` can only be used during component initialisation\nhttps://svelte.dev/e/lifecycle_outside_component`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
/**
* Cannot create a `$derived(...)` with an `await` expression outside of an effect tree
* @returns {never}
*/
function async_derived_orphan() {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`async_derived_orphan\nCannot create a \`$derived(...)\` with an \`await\` expression outside of an effect tree\nhttps://svelte.dev/e/async_derived_orphan`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/async_derived_orphan`);
}
/**
* A derived value cannot reference itself recursively
* @returns {never}
*/
function derived_references_self() {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`derived_references_self\nA derived value cannot reference itself recursively\nhttps://svelte.dev/e/derived_references_self`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/derived_references_self`);
}
/**
* Keyed each block has duplicate key `%value%` at indexes %a% and %b%
* @param {string} a
* @param {string} b
* @param {string | undefined | null} [value]
* @returns {never}
*/
function each_key_duplicate(a, b, value) {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`each_key_duplicate\n${value ? `Keyed each block has duplicate key \`${value}\` at indexes ${a} and ${b}` : `Keyed each block has duplicate key at indexes ${a} and ${b}`}\nhttps://svelte.dev/e/each_key_duplicate`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/each_key_duplicate`);
}
/**
* Keyed each block has key that is not idempotent — the key for item at index %index% was `%a%` but is now `%b%`. Keys must be the same each time for a given item
* @param {string} index
* @param {string} a
* @param {string} b
* @returns {never}
*/
function each_key_volatile(index, a, b) {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`each_key_volatile\nKeyed each block has key that is not idempotent — the key for item at index ${index} was \`${a}\` but is now \`${b}\`. Keys must be the same each time for a given item\nhttps://svelte.dev/e/each_key_volatile`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/each_key_volatile`);
}
/**
* `%rune%` cannot be used inside an effect cleanup function
* @param {string} rune
* @returns {never}
*/
function effect_in_teardown(rune) {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`effect_in_teardown\n\`${rune}\` cannot be used inside an effect cleanup function\nhttps://svelte.dev/e/effect_in_teardown`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/effect_in_teardown`);
}
/**
* Effect cannot be created inside a `$derived` value that was not itself created inside an effect
* @returns {never}
*/
function effect_in_unowned_derived() {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`effect_in_unowned_derived\nEffect cannot be created inside a \`$derived\` value that was not itself created inside an effect\nhttps://svelte.dev/e/effect_in_unowned_derived`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
}
/**
* `%rune%` can only be used inside an effect (e.g. during component initialisation)
* @param {string} rune
* @returns {never}
*/
function effect_orphan(rune) {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`effect_orphan\n\`${rune}\` can only be used inside an effect (e.g. during component initialisation)\nhttps://svelte.dev/e/effect_orphan`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/effect_orphan`);
}
/**
* Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
* @returns {never}
*/
function effect_update_depth_exceeded() {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`effect_update_depth_exceeded\nMaximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state\nhttps://svelte.dev/e/effect_update_depth_exceeded`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
}
/**
* Cannot do `bind:%key%={undefined}` when `%key%` has a fallback value
* @param {string} key
* @returns {never}
*/
function props_invalid_value(key) {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`props_invalid_value\nCannot do \`bind:${key}={undefined}\` when \`${key}\` has a fallback value\nhttps://svelte.dev/e/props_invalid_value`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/props_invalid_value`);
}
/**
* The `%rune%` rune is only available inside `.svelte` and `.svelte.js/ts` files
* @param {string} rune
* @returns {never}
*/
function rune_outside_svelte(rune) {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`rune_outside_svelte\nThe \`${rune}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files\nhttps://svelte.dev/e/rune_outside_svelte`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/rune_outside_svelte`);
}
/**
* Property descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.
* @returns {never}
*/
function state_descriptors_fixed() {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`state_descriptors_fixed\nProperty descriptors defined on \`$state\` objects must contain \`value\` and always be \`enumerable\`, \`configurable\` and \`writable\`.\nhttps://svelte.dev/e/state_descriptors_fixed`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
}
/**
* Cannot set prototype of `$state` object
* @returns {never}
*/
function state_prototype_fixed() {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`state_prototype_fixed\nCannot set prototype of \`$state\` object\nhttps://svelte.dev/e/state_prototype_fixed`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
}
/**
* Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`
* @returns {never}
*/
function state_unsafe_mutation() {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`state_unsafe_mutation\nUpdating state inside \`$derived(...)\`, \`$inspect(...)\` or a template expression is forbidden. If the value should not be reactive, declare it without \`$state\`\nhttps://svelte.dev/e/state_unsafe_mutation`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
}
/**
* A `<svelte:boundary>` `reset` function cannot be called while an error is still being handled
* @returns {never}
*/
function svelte_boundary_reset_onerror() {
	if (dev_fallback_default) {
		const error = /* @__PURE__ */ new Error(`svelte_boundary_reset_onerror\nA \`<svelte:boundary>\` \`reset\` function cannot be called while an error is still being handled\nhttps://svelte.dev/e/svelte_boundary_reset_onerror`);
		error.name = "Svelte error";
		throw error;
	} else throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
}
//#endregion
//#region node_modules/svelte/src/constants.js
var HYDRATION_ERROR = {};
var UNINITIALIZED = Symbol();
var FILENAME = Symbol("filename");
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
//#endregion
//#region node_modules/svelte/src/internal/client/warnings.js
var bold = "font-weight: bold";
var normal = "font-weight: normal";
/**
* Detected reactivity loss when reading `%name%`. This happens when state is read in an async function after an earlier `await`
* @param {string} name
*/
function await_reactivity_loss(name) {
	if (dev_fallback_default) console.warn(`%c[svelte] await_reactivity_loss\n%cDetected reactivity loss when reading \`${name}\`. This happens when state is read in an async function after an earlier \`await\`\nhttps://svelte.dev/e/await_reactivity_loss`, bold, normal);
	else console.warn(`https://svelte.dev/e/await_reactivity_loss`);
}
/**
* An async derived, `%name%` (%location%) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app
* @param {string} name
* @param {string} location
*/
function await_waterfall(name, location) {
	if (dev_fallback_default) console.warn(`%c[svelte] await_waterfall\n%cAn async derived, \`${name}\` (${location}) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app\nhttps://svelte.dev/e/await_waterfall`, bold, normal);
	else console.warn(`https://svelte.dev/e/await_waterfall`);
}
/**
* Reading a derived belonging to a now-destroyed effect may result in stale values
*/
function derived_inert() {
	if (dev_fallback_default) console.warn(`%c[svelte] derived_inert\n%cReading a derived belonging to a now-destroyed effect may result in stale values\nhttps://svelte.dev/e/derived_inert`, bold, normal);
	else console.warn(`https://svelte.dev/e/derived_inert`);
}
/**
* The `%attribute%` attribute on `%html%` changed its value between server and client renders. The client value, `%value%`, will be ignored in favour of the server value
* @param {string} attribute
* @param {string} html
* @param {string} value
*/
function hydration_attribute_changed(attribute, html, value) {
	if (dev_fallback_default) console.warn(`%c[svelte] hydration_attribute_changed\n%cThe \`${attribute}\` attribute on \`${html}\` changed its value between server and client renders. The client value, \`${value}\`, will be ignored in favour of the server value\nhttps://svelte.dev/e/hydration_attribute_changed`, bold, normal);
	else console.warn(`https://svelte.dev/e/hydration_attribute_changed`);
}
/**
* Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near %location%
* @param {string | undefined | null} [location]
*/
function hydration_mismatch(location) {
	if (dev_fallback_default) console.warn(`%c[svelte] hydration_mismatch\n%c${location ? `Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near ${location}` : "Hydration failed because the initial UI does not match what was rendered on the server"}\nhttps://svelte.dev/e/hydration_mismatch`, bold, normal);
	else console.warn(`https://svelte.dev/e/hydration_mismatch`);
}
/**
* The `value` property of a `<select multiple>` element should be an array, but it received a non-array value. The selection will be kept as is.
*/
function select_multiple_invalid_value() {
	if (dev_fallback_default) console.warn(`%c[svelte] select_multiple_invalid_value\n%cThe \`value\` property of a \`<select multiple>\` element should be an array, but it received a non-array value. The selection will be kept as is.\nhttps://svelte.dev/e/select_multiple_invalid_value`, bold, normal);
	else console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
}
/**
* Reactive `$state(...)` proxies and the values they proxy have different identities. Because of this, comparisons with `%operator%` will produce unexpected results
* @param {string} operator
*/
function state_proxy_equality_mismatch(operator) {
	if (dev_fallback_default) console.warn(`%c[svelte] state_proxy_equality_mismatch\n%cReactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${operator}\` will produce unexpected results\nhttps://svelte.dev/e/state_proxy_equality_mismatch`, bold, normal);
	else console.warn(`https://svelte.dev/e/state_proxy_equality_mismatch`);
}
/**
* A `<svelte:boundary>` `reset` function only resets the boundary the first time it is called
*/
function svelte_boundary_reset_noop() {
	if (dev_fallback_default) console.warn(`%c[svelte] svelte_boundary_reset_noop\n%cA \`<svelte:boundary>\` \`reset\` function only resets the boundary the first time it is called\nhttps://svelte.dev/e/svelte_boundary_reset_noop`, bold, normal);
	else console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
/** @import { TemplateNode } from '#client' */
/**
* Use this variable to guard everything related to hydration code so it can be treeshaken out
* if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
*/
var hydrating = false;
/** @param {boolean} value */
function set_hydrating(value) {
	hydrating = value;
}
/**
* The node that is currently being hydrated. This starts out as the first node inside the opening
* <!--[--> comment, and updates each time a component calls `$.child(...)` or `$.sibling(...)`.
* When entering a block (e.g. `{#if ...}`), `hydrate_node` is the block opening comment; by the
* time we leave the block it is the closing comment, which serves as the block's anchor.
* @type {TemplateNode}
*/
var hydrate_node;
/** @param {TemplateNode | null} node */
function set_hydrate_node(node) {
	if (node === null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	return hydrate_node = node;
}
function hydrate_next() {
	return set_hydrate_node(/* @__PURE__ */ get_next_sibling(hydrate_node));
}
/** @param {TemplateNode} node */
function reset(node) {
	if (!hydrating) return;
	if (/* @__PURE__ */ get_next_sibling(hydrate_node) !== null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	hydrate_node = node;
}
function next(count = 1) {
	if (hydrating) {
		var i = count;
		var node = hydrate_node;
		while (i--) node = /* @__PURE__ */ get_next_sibling(node);
		hydrate_node = node;
	}
}
/**
* Skips or removes (depending on {@link remove}) all nodes starting at `hydrate_node` up until the next hydration end comment
* @param {boolean} remove
*/
function skip_nodes(remove = true) {
	var depth = 0;
	var node = hydrate_node;
	while (true) {
		if (node.nodeType === 8) {
			var data = node.data;
			if (data === "]") {
				if (depth === 0) return node;
				depth -= 1;
			} else if (data === "[" || data === "[!" || data[0] === "[" && !isNaN(Number(data.slice(1)))) depth += 1;
		}
		var next = /* @__PURE__ */ get_next_sibling(node);
		if (remove) node.remove();
		node = next;
	}
}
/**
*
* @param {TemplateNode} node
*/
function read_hydration_instruction(node) {
	if (!node || node.nodeType !== 8) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	return node.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
/** @import { Equals } from '#client' */
/** @type {Equals} */
function equals(value) {
	return value === this.v;
}
/**
* @param {unknown} a
* @param {unknown} b
* @returns {boolean}
*/
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
/** @type {Equals} */
function safe_equals(value) {
	return !safe_not_equal(value, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/flags/index.js
/** True if experimental.async=true */
var async_mode_flag = false;
/** True if we're not certain that we only have Svelte 5 code in the compilation */
var legacy_mode_flag = false;
/** True if $inspect.trace is used */
var tracing_mode_flag = false;
//#endregion
//#region node_modules/svelte/src/internal/client/dev/tracing.js
/**
* @typedef {{
*   traces: Error[];
* }} TraceEntry
*/
/** @type {{ reaction: Reaction | null, entries: Map<Value, TraceEntry> } | null} */
var tracing_expressions = null;
/**
* @param {Value} source
* @param {string} label
*/
function tag(source, label) {
	source.label = label;
	tag_proxy(source.v, label);
	return source;
}
/**
* @param {unknown} value
* @param {string} label
*/
function tag_proxy(value, label) {
	value?.[PROXY_PATH_SYMBOL]?.(label);
	return value;
}
/**
* @param {unknown} value
*/
function label(value) {
	if (typeof value === "symbol") return `Symbol(${value.description})`;
	if (typeof value === "function") return "<function>";
	if (typeof value === "object" && value) return "<object>";
	return String(value);
}
//#endregion
//#region node_modules/svelte/src/internal/shared/dev.js
/**
* @param {string} label
* @returns {Error & { stack: string } | null}
*/
function get_error(label) {
	const error = /* @__PURE__ */ new Error();
	const stack = get_stack();
	if (stack.length === 0) return null;
	stack.unshift("\n");
	define_property(error, "stack", { value: stack.join("\n") });
	define_property(error, "name", { value: label });
	return error;
}
/**
* @returns {string[]}
*/
function get_stack() {
	const limit = Error.stackTraceLimit;
	Error.stackTraceLimit = Infinity;
	const stack = (/* @__PURE__ */ new Error()).stack;
	Error.stackTraceLimit = limit;
	if (!stack) return [];
	const lines = stack.split("\n");
	const new_lines = [];
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const posixified = line.replaceAll("\\", "/");
		if (line.trim() === "Error") continue;
		if (line.includes("validate_each_keys")) return [];
		if (posixified.includes("svelte/src/internal") || posixified.includes("node_modules/.vite")) continue;
		new_lines.push(line);
	}
	return new_lines;
}
/**
* @param {boolean} condition
* @param {string} message
*/
function invariant(condition, message) {
	if (!dev_fallback_default) throw new Error("invariant(...) was not guarded by if (DEV)");
	if (!condition) invariant_violation(message);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
/** @import { ComponentContext, DevStackEntry, Effect } from '#client' */
/** @type {ComponentContext | null} */
var component_context = null;
/** @param {ComponentContext | null} context */
function set_component_context(context) {
	component_context = context;
}
/** @type {DevStackEntry | null} */
var dev_stack = null;
/** @param {DevStackEntry | null} stack */
function set_dev_stack(stack) {
	dev_stack = stack;
}
/**
* The current component function. Different from current component context:
* ```html
* <!-- App.svelte -->
* <Foo>
*   <Bar /> <!-- context == Foo.svelte, function == App.svelte -->
* </Foo>
* ```
* @type {ComponentContext['function']}
*/
var dev_current_component_function = null;
/** @param {ComponentContext['function']} fn */
function set_dev_current_component_function(fn) {
	dev_current_component_function = fn;
}
/**
* @param {Record<string, unknown>} props
* @param {any} runes
* @param {Function} [fn]
* @returns {void}
*/
function push(props, runes = false, fn) {
	component_context = {
		p: component_context,
		i: false,
		c: null,
		e: null,
		s: props,
		x: null,
		r: active_effect,
		l: legacy_mode_flag && !runes ? {
			s: null,
			u: null,
			$: []
		} : null
	};
	if (dev_fallback_default) {
		component_context.function = fn;
		dev_current_component_function = fn;
	}
}
/**
* @template {Record<string, any>} T
* @param {T} [component]
* @returns {T}
*/
function pop(component) {
	var context = component_context;
	var effects = context.e;
	if (effects !== null) {
		context.e = null;
		for (var fn of effects) create_user_effect(fn);
	}
	if (component !== void 0) context.x = component;
	context.i = true;
	component_context = context.p;
	if (dev_fallback_default) dev_current_component_function = component_context?.function ?? null;
	return component ?? {};
}
/** @returns {boolean} */
function is_runes() {
	return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
/** @type {Array<() => void>} */
var micro_tasks = [];
function run_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}
/**
* @param {() => void} fn
*/
function queue_micro_task(fn) {
	if (micro_tasks.length === 0 && !is_flushing_sync) {
		var tasks = micro_tasks;
		queueMicrotask(() => {
			if (tasks === micro_tasks) run_micro_tasks();
		});
	}
	micro_tasks.push(fn);
}
//#endregion
//#region node_modules/svelte/src/internal/client/error-handling.js
/** @import { Derived, Effect } from '#client' */
/** @import { Boundary } from './dom/blocks/boundary.js' */
var adjustments = /* @__PURE__ */ new WeakMap();
/**
* @param {unknown} error
*/
function handle_error(error) {
	var effect = active_effect;
	if (effect === null) {
		/** @type {Derived} */ active_reaction.f |= ERROR_VALUE;
		return error;
	}
	if (dev_fallback_default && error instanceof Error && !adjustments.has(error)) adjustments.set(error, get_adjustments(error, effect));
	if ((effect.f & 32768) === 0 && (effect.f & 4) === 0) {
		if (dev_fallback_default && !effect.parent && error instanceof Error) apply_adjustments(error);
		throw error;
	}
	invoke_error_boundary(error, effect);
}
/**
* @param {unknown} error
* @param {Effect | null} effect
*/
function invoke_error_boundary(error, effect) {
	while (effect !== null) {
		if ((effect.f & 128) !== 0) {
			if ((effect.f & 32768) === 0) throw error;
			try {
				/** @type {Boundary} */ effect.b.error(error);
				return;
			} catch (e) {
				error = e;
			}
		}
		effect = effect.parent;
	}
	if (dev_fallback_default && error instanceof Error) apply_adjustments(error);
	throw error;
}
/**
* Add useful information to the error message/stack in development
* @param {Error} error
* @param {Effect} effect
*/
function get_adjustments(error, effect) {
	const message_descriptor = get_descriptor(error, "message");
	if (message_descriptor && !message_descriptor.configurable) return;
	var indent = is_firefox ? "  " : "	";
	var component_stack = `\n${indent}in ${effect.fn?.name || "<unknown>"}`;
	var context = effect.ctx;
	while (context !== null) {
		component_stack += `\n${indent}in ${context.function?.[FILENAME].split("/").pop()}`;
		context = context.p;
	}
	return {
		message: error.message + `\n${component_stack}\n`,
		stack: error.stack?.split("\n").filter((line) => !line.includes("svelte/src/internal")).join("\n")
	};
}
/**
* @param {Error} error
*/
function apply_adjustments(error) {
	const adjusted = adjustments.get(error);
	if (adjusted) {
		define_property(error, "message", { value: adjusted.message });
		define_property(error, "stack", { value: adjusted.stack });
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
/** @import { Derived, Signal } from '#client' */
var STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
/**
* @param {Signal} signal
* @param {number} status
*/
function set_signal_status(signal, status) {
	signal.f = signal.f & STATUS_MASK | status;
}
/**
* Set a derived's status to CLEAN or MAYBE_DIRTY based on its connection state.
* @param {Derived} derived
*/
function update_derived_status(derived) {
	if ((derived.f & 512) !== 0 || derived.deps === null) set_signal_status(derived, CLEAN);
	else set_signal_status(derived, MAYBE_DIRTY);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
/** @import { Derived, Effect, Value } from '#client' */
/**
* @param {Value[] | null} deps
*/
function clear_marked(deps) {
	if (deps === null) return;
	for (const dep of deps) {
		if ((dep.f & 2) === 0 || (dep.f & 65536) === 0) continue;
		dep.f ^= WAS_MARKED;
		clear_marked(
			/** @type {Derived} */
			dep.deps
		);
	}
}
/**
* @param {Effect} effect
* @param {Set<Effect>} dirty_effects
* @param {Set<Effect>} maybe_dirty_effects
*/
function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
	if ((effect.f & 2048) !== 0) dirty_effects.add(effect);
	else if ((effect.f & 4096) !== 0) maybe_dirty_effects.add(effect);
	clear_marked(effect.deps);
	set_signal_status(effect, CLEAN);
}
//#endregion
//#region node_modules/svelte/src/store/utils.js
/** @import { Readable } from './public' */
/**
* @template T
* @param {Readable<T> | null | undefined} store
* @param {(value: T) => void} run
* @param {(value: T) => void} [invalidate]
* @returns {() => void}
*/
function subscribe_to_store(store, run, invalidate) {
	if (store == null) {
		run(void 0);
		if (invalidate) invalidate(void 0);
		return noop;
	}
	const unsub = untrack(() => store.subscribe(run, invalidate));
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
//#endregion
//#region node_modules/svelte/src/store/shared/index.js
/** @import { Readable, StartStopNotifier, Subscriber, Unsubscriber, Updater, Writable } from '../public.js' */
/** @import { Stores, StoresValues, SubscribeInvalidateTuple } from '../private.js' */
/**
* @type {Array<SubscribeInvalidateTuple<any> | any>}
*/
var subscriber_queue = [];
/**
* Create a `Writable` store that allows both updating and reading by subscription.
*
* @template T
* @param {T} [value] initial value
* @param {StartStopNotifier<T>} [start]
* @returns {Writable<T>}
*/
function writable(value, start = noop) {
	/** @type {Unsubscriber | null} */
	let stop = null;
	/** @type {Set<SubscribeInvalidateTuple<T>>} */
	const subscribers = /* @__PURE__ */ new Set();
	/**
	* @param {T} new_value
	* @returns {void}
	*/
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) subscriber_queue[i][0](subscriber_queue[i + 1]);
					subscriber_queue.length = 0;
				}
			}
		}
	}
	/**
	* @param {Updater<T>} fn
	* @returns {void}
	*/
	function update(fn) {
		set(fn(value));
	}
	/**
	* @param {Subscriber<T>} run
	* @param {() => void} [invalidate]
	* @returns {Unsubscriber}
	*/
	function subscribe(run, invalidate = noop) {
		/** @type {SubscribeInvalidateTuple<T>} */
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) stop = start(set, update) || noop;
		run(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return {
		set,
		update,
		subscribe
	};
}
/**
* Get the current value from a store by subscribing and immediately unsubscribing.
*
* @template T
* @param {Readable<T>} store
* @returns {T}
*/
function get$1(store) {
	let value;
	subscribe_to_store(store, (_) => value = _)();
	return value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
/** @import { StoreReferencesContainer } from '#client' */
/** @import { Store } from '#shared' */
/**
* We set this to `true` when updating a store so that we correctly
* schedule effects if the update takes place inside a `$:` effect
*/
var legacy_is_updating_store = false;
/**
* Whether or not the prop currently being read is a store binding, as in
* `<Child bind:x={$y} />`. If it is, we treat the prop as mutable even in
* runes mode, and skip `binding_property_non_reactive` validation
*/
var is_store_binding = false;
var IS_UNMOUNTED = Symbol();
/**
* Gets the current value of a store. If the store isn't subscribed to yet, it will create a proxy
* signal that will be updated when the store is. The store references container is needed to
* track reassignments to stores and to track the correct component context.
* @template V
* @param {Store<V> | null | undefined} store
* @param {string} store_name
* @param {StoreReferencesContainer} stores
* @returns {V}
*/
function store_get(store, store_name, stores) {
	const entry = stores[store_name] ??= {
		store: null,
		source: /* @__PURE__ */ mutable_source(void 0),
		unsubscribe: noop
	};
	if (dev_fallback_default) entry.source.label = store_name;
	if (entry.store !== store && !(IS_UNMOUNTED in stores)) {
		entry.unsubscribe();
		entry.store = store ?? null;
		if (store == null) {
			entry.source.v = void 0;
			entry.unsubscribe = noop;
		} else {
			var is_synchronous_callback = true;
			entry.unsubscribe = subscribe_to_store(store, (v) => {
				if (is_synchronous_callback) entry.source.v = v;
				else set(entry.source, v);
			});
			is_synchronous_callback = false;
		}
	}
	if (store && IS_UNMOUNTED in stores) return get$1(store);
	return get(entry.source);
}
/**
* Unsubscribes from all auto-subscribed stores on destroy
* @returns {[StoreReferencesContainer, ()=>void]}
*/
function setup_stores() {
	/** @type {StoreReferencesContainer} */
	const stores = {};
	function cleanup() {
		teardown(() => {
			for (var store_name in stores) stores[store_name].unsubscribe();
			define_property(stores, IS_UNMOUNTED, {
				enumerable: false,
				value: true
			});
		});
	}
	return [stores, cleanup];
}
/**
* Returns a tuple that indicates whether `fn()` reads a prop that is a store binding.
* Used to prevent `binding_property_non_reactive` validation false positives and
* ensure that these props are treated as mutable even in runes mode
* @template T
* @param {() => T} fn
* @returns {[T, boolean]}
*/
function capture_store_binding(fn) {
	var previous_is_store_binding = is_store_binding;
	try {
		is_store_binding = false;
		return [fn(), is_store_binding];
	} finally {
		is_store_binding = previous_is_store_binding;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
/** @import { Fork } from 'svelte' */
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
/** @type {Set<Batch>} */
var batches = /* @__PURE__ */ new Set();
/** @type {Batch | null} */
var current_batch = null;
/**
* When time travelling (i.e. working in one batch, while other batches
* still have ongoing work), we ignore the real values of affected
* signals in favour of their values within the batch
* @type {Map<Value, any> | null}
*/
var batch_values = null;
/** @type {Effect | null} */
var last_scheduled_effect = null;
var is_flushing_sync = false;
var is_processing = false;
/**
* During traversal, this is an array. Newly created effects are (if not immediately
* executed) pushed to this array, rather than going through the scheduling
* rigamarole that would cause another turn of the flush loop.
* @type {Effect[] | null}
*/
var collected_effects = null;
/**
* An array of effects that are marked during traversal as a result of a `set`
* (not `internal_set`) call. These will be added to the next batch and
* trigger another `batch.process()`
* @type {Effect[] | null}
* @deprecated when we get rid of legacy mode and stores, we can get rid of this
*/
var legacy_updates = null;
var flush_count = 0;
var source_stacks = dev_fallback_default ? /* @__PURE__ */ new Set() : null;
var uid = 1;
var Batch = class Batch {
	id = uid++;
	/**
	* The current values of any signals that are updated in this batch.
	* Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
	* They keys of this map are identical to `this.#previous`
	* @type {Map<Value, [any, boolean]>}
	*/
	current = /* @__PURE__ */ new Map();
	/**
	* The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
	* They keys of this map are identical to `this.#current`
	* @type {Map<Value, any>}
	*/
	previous = /* @__PURE__ */ new Map();
	/**
	* When the batch is committed (and the DOM is updated), we need to remove old branches
	* and append new ones by calling the functions added inside (if/each/key/etc) blocks
	* @type {Set<(batch: Batch) => void>}
	*/
	#commit_callbacks = /* @__PURE__ */ new Set();
	/**
	* If a fork is discarded, we need to destroy any effects that are no longer needed
	* @type {Set<(batch: Batch) => void>}
	*/
	#discard_callbacks = /* @__PURE__ */ new Set();
	/**
	* Callbacks that should run only when a fork is committed.
	* @type {Set<(batch: Batch) => void>}
	*/
	#fork_commit_callbacks = /* @__PURE__ */ new Set();
	/**
	* Async effects that are currently in flight
	* @type {Map<Effect, number>}
	*/
	#pending = /* @__PURE__ */ new Map();
	/**
	* Async effects that are currently in flight, _not_ inside a pending boundary
	* @type {Map<Effect, number>}
	*/
	#blocking_pending = /* @__PURE__ */ new Map();
	/**
	* A deferred that resolves when the batch is committed, used with `settled()`
	* TODO replace with Promise.withResolvers once supported widely enough
	* @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
	*/
	#deferred = null;
	/**
	* The root effects that need to be flushed
	* @type {Effect[]}
	*/
	#roots = [];
	/**
	* Effects created while this batch was active.
	* @type {Effect[]}
	*/
	#new_effects = [];
	/**
	* Deferred effects (which run after async work has completed) that are DIRTY
	* @type {Set<Effect>}
	*/
	#dirty_effects = /* @__PURE__ */ new Set();
	/**
	* Deferred effects that are MAYBE_DIRTY
	* @type {Set<Effect>}
	*/
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	/**
	* A map of branches that still exist, but will be destroyed when this batch
	* is committed — we skip over these during `process`.
	* The value contains child effects that were dirty/maybe_dirty before being reset,
	* so they can be rescheduled if the branch survives.
	* @type {Map<Effect, { d: Effect[], m: Effect[] }>}
	*/
	#skipped_branches = /* @__PURE__ */ new Map();
	/**
	* Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
	* @type {Set<Effect>}
	*/
	#unskipped_branches = /* @__PURE__ */ new Set();
	is_fork = false;
	#decrement_queued = false;
	/** @type {Set<Batch>} */
	#blockers = /* @__PURE__ */ new Set();
	#is_deferred() {
		return this.is_fork || this.#blocking_pending.size > 0;
	}
	#is_blocked() {
		for (const batch of this.#blockers) for (const effect of batch.#blocking_pending.keys()) {
			var skipped = false;
			var e = effect;
			while (e.parent !== null) {
				if (this.#skipped_branches.has(e)) {
					skipped = true;
					break;
				}
				e = e.parent;
			}
			if (!skipped) return true;
		}
		return false;
	}
	/**
	* Add an effect to the #skipped_branches map and reset its children
	* @param {Effect} effect
	*/
	skip_effect(effect) {
		if (!this.#skipped_branches.has(effect)) this.#skipped_branches.set(effect, {
			d: [],
			m: []
		});
		this.#unskipped_branches.delete(effect);
	}
	/**
	* Remove an effect from the #skipped_branches map and reschedule
	* any tracked dirty/maybe_dirty child effects
	* @param {Effect} effect
	* @param {(e: Effect) => void} callback
	*/
	unskip_effect(effect, callback = (e) => this.schedule(e)) {
		var tracked = this.#skipped_branches.get(effect);
		if (tracked) {
			this.#skipped_branches.delete(effect);
			for (var e of tracked.d) {
				set_signal_status(e, DIRTY);
				callback(e);
			}
			for (e of tracked.m) {
				set_signal_status(e, MAYBE_DIRTY);
				callback(e);
			}
		}
		this.#unskipped_branches.add(effect);
	}
	#process() {
		if (flush_count++ > 1e3) {
			batches.delete(this);
			infinite_loop_guard();
		}
		if (!this.#is_deferred()) {
			for (const e of this.#dirty_effects) {
				this.#maybe_dirty_effects.delete(e);
				set_signal_status(e, DIRTY);
				this.schedule(e);
			}
			for (const e of this.#maybe_dirty_effects) {
				set_signal_status(e, MAYBE_DIRTY);
				this.schedule(e);
			}
		}
		const roots = this.#roots;
		this.#roots = [];
		this.apply();
		/** @type {Effect[]} */
		var effects = collected_effects = [];
		/** @type {Effect[]} */
		var render_effects = [];
		/**
		* @type {Effect[]}
		* @deprecated when we get rid of legacy mode and stores, we can get rid of this
		*/
		var updates = legacy_updates = [];
		for (const root of roots) try {
			this.#traverse(root, effects, render_effects);
		} catch (e) {
			reset_all(root);
			throw e;
		}
		current_batch = null;
		if (updates.length > 0) {
			var batch = Batch.ensure();
			for (const e of updates) batch.schedule(e);
		}
		collected_effects = null;
		legacy_updates = null;
		if (this.#is_deferred() || this.#is_blocked()) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			for (const [e, t] of this.#skipped_branches) reset_branch(e, t);
		} else {
			if (this.#pending.size === 0) batches.delete(this);
			this.#dirty_effects.clear();
			this.#maybe_dirty_effects.clear();
			for (const fn of this.#commit_callbacks) fn(this);
			this.#commit_callbacks.clear();
			this;
			flush_queued_effects(render_effects);
			flush_queued_effects(effects);
			this.#deferred?.resolve();
		}
		var next_batch = current_batch;
		if (this.#roots.length > 0) {
			const batch = next_batch ??= this;
			batch.#roots.push(...this.#roots.filter((r) => !batch.#roots.includes(r)));
		}
		if (next_batch !== null) {
			batches.add(next_batch);
			if (dev_fallback_default) for (const source of this.current.keys())
 /** @type {Set<Source>} */ source_stacks.add(source);
			next_batch.#process();
		}
		if (async_mode_flag && !batches.has(this)) this.#commit();
	}
	/**
	* Traverse the effect tree, executing effects or stashing
	* them for later execution as appropriate
	* @param {Effect} root
	* @param {Effect[]} effects
	* @param {Effect[]} render_effects
	*/
	#traverse(root, effects, render_effects) {
		root.f ^= CLEAN;
		var effect = root.first;
		while (effect !== null) {
			var flags = effect.f;
			var is_branch = (flags & 96) !== 0;
			if (!(is_branch && (flags & 1024) !== 0 || (flags & 8192) !== 0 || this.#skipped_branches.has(effect)) && effect.fn !== null) {
				if (is_branch) effect.f ^= CLEAN;
				else if ((flags & 4) !== 0) effects.push(effect);
				else if (async_mode_flag && (flags & 16777224) !== 0) render_effects.push(effect);
				else if (is_dirty(effect)) {
					if ((flags & 16) !== 0) this.#maybe_dirty_effects.add(effect);
					update_effect(effect);
				}
				var child = effect.first;
				if (child !== null) {
					effect = child;
					continue;
				}
			}
			while (effect !== null) {
				var next = effect.next;
				if (next !== null) {
					effect = next;
					break;
				}
				effect = effect.parent;
			}
		}
	}
	/**
	* @param {Effect[]} effects
	*/
	#defer_effects(effects) {
		for (var i = 0; i < effects.length; i += 1) defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Associate a change to a given source with the current
	* batch, noting its previous and current values
	* @param {Value} source
	* @param {any} value
	* @param {boolean} [is_derived]
	*/
	capture(source, value, is_derived = false) {
		if (source.v !== UNINITIALIZED && !this.previous.has(source)) this.previous.set(source, source.v);
		if ((source.f & 8388608) === 0) {
			this.current.set(source, [value, is_derived]);
			batch_values?.set(source, value);
		}
		if (!this.is_fork) source.v = value;
	}
	activate() {
		current_batch = this;
	}
	deactivate() {
		current_batch = null;
		batch_values = null;
	}
	flush() {
		var source_stacks = dev_fallback_default ? /* @__PURE__ */ new Set() : null;
		try {
			is_processing = true;
			current_batch = this;
			this.#process();
		} finally {
			flush_count = 0;
			last_scheduled_effect = null;
			collected_effects = null;
			legacy_updates = null;
			is_processing = false;
			current_batch = null;
			batch_values = null;
			old_values.clear();
			if (dev_fallback_default) for (const source of source_stacks) source.updated = null;
		}
	}
	discard() {
		for (const fn of this.#discard_callbacks) fn(this);
		this.#discard_callbacks.clear();
		this.#fork_commit_callbacks.clear();
		batches.delete(this);
	}
	/**
	* @param {Effect} effect
	*/
	register_created_effect(effect) {
		this.#new_effects.push(effect);
	}
	#commit() {
		for (const batch of batches) {
			var is_earlier = batch.id < this.id;
			/** @type {Source[]} */
			var sources = [];
			for (const [source, [value, is_derived]] of this.current) {
				if (batch.current.has(source)) {
					var batch_value = batch.current.get(source)[0];
					if (is_earlier && value !== batch_value) batch.current.set(source, [value, is_derived]);
					else continue;
				}
				sources.push(source);
			}
			var others = [...batch.current.keys()].filter((s) => !this.current.has(s));
			if (others.length === 0) {
				if (is_earlier) batch.discard();
			} else if (sources.length > 0) {
				if (dev_fallback_default) invariant(batch.#roots.length === 0, "Batch has scheduled roots");
				if (is_earlier) for (const unskipped of this.#unskipped_branches) batch.unskip_effect(unskipped, (e) => {
					if ((e.f & 4194320) !== 0) batch.schedule(e);
					else batch.#defer_effects([e]);
				});
				batch.activate();
				/** @type {Set<Value>} */
				var marked = /* @__PURE__ */ new Set();
				/** @type {Map<Reaction, boolean>} */
				var checked = /* @__PURE__ */ new Map();
				for (var source of sources) mark_effects(source, others, marked, checked);
				checked = /* @__PURE__ */ new Map();
				var current_unequal = [...batch.current.keys()].filter((c) => this.current.has(c) ? this.current.get(c)[0] !== c : true);
				for (const effect of this.#new_effects) if ((effect.f & 155648) === 0 && depends_on(effect, current_unequal, checked)) if ((effect.f & 4194320) !== 0) {
					set_signal_status(effect, DIRTY);
					batch.schedule(effect);
				} else batch.#dirty_effects.add(effect);
				if (batch.#roots.length > 0) {
					batch.apply();
					for (var root of batch.#roots) batch.#traverse(root, [], []);
					batch.#roots = [];
				}
				batch.deactivate();
			}
		}
		for (const batch of batches) if (batch.#blockers.has(this)) {
			batch.#blockers.delete(this);
			if (batch.#blockers.size === 0 && !batch.#is_deferred()) {
				batch.activate();
				batch.#process();
			}
		}
	}
	/**
	* @param {boolean} blocking
	* @param {Effect} effect
	*/
	increment(blocking, effect) {
		let pending_count = this.#pending.get(effect) ?? 0;
		this.#pending.set(effect, pending_count + 1);
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			this.#blocking_pending.set(effect, blocking_pending_count + 1);
		}
	}
	/**
	* @param {boolean} blocking
	* @param {Effect} effect
	* @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
	*/
	decrement(blocking, effect, skip) {
		let pending_count = this.#pending.get(effect) ?? 0;
		if (pending_count === 1) this.#pending.delete(effect);
		else this.#pending.set(effect, pending_count - 1);
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			if (blocking_pending_count === 1) this.#blocking_pending.delete(effect);
			else this.#blocking_pending.set(effect, blocking_pending_count - 1);
		}
		if (this.#decrement_queued || skip) return;
		this.#decrement_queued = true;
		queue_micro_task(() => {
			this.#decrement_queued = false;
			this.flush();
		});
	}
	/**
	* @param {Set<Effect>} dirty_effects
	* @param {Set<Effect>} maybe_dirty_effects
	*/
	transfer_effects(dirty_effects, maybe_dirty_effects) {
		for (const e of dirty_effects) this.#dirty_effects.add(e);
		for (const e of maybe_dirty_effects) this.#maybe_dirty_effects.add(e);
		dirty_effects.clear();
		maybe_dirty_effects.clear();
	}
	/** @param {(batch: Batch) => void} fn */
	oncommit(fn) {
		this.#commit_callbacks.add(fn);
	}
	/** @param {(batch: Batch) => void} fn */
	ondiscard(fn) {
		this.#discard_callbacks.add(fn);
	}
	/** @param {(batch: Batch) => void} fn */
	on_fork_commit(fn) {
		this.#fork_commit_callbacks.add(fn);
	}
	run_fork_commit_callbacks() {
		for (const fn of this.#fork_commit_callbacks) fn(this);
		this.#fork_commit_callbacks.clear();
	}
	settled() {
		return (this.#deferred ??= deferred()).promise;
	}
	static ensure() {
		if (current_batch === null) {
			const batch = current_batch = new Batch();
			if (!is_processing) {
				batches.add(current_batch);
				if (!is_flushing_sync) queue_micro_task(() => {
					if (current_batch !== batch) return;
					batch.flush();
				});
			}
		}
		return current_batch;
	}
	apply() {
		if (!async_mode_flag || !this.is_fork && batches.size === 1) {
			batch_values = null;
			return;
		}
		batch_values = /* @__PURE__ */ new Map();
		for (const [source, [value]] of this.current) batch_values.set(source, value);
		for (const batch of batches) {
			if (batch === this || batch.is_fork) continue;
			var intersects = false;
			var differs = false;
			if (batch.id < this.id) for (const [source, [, is_derived]] of batch.current) {
				if (is_derived) continue;
				intersects ||= this.current.has(source);
				differs ||= !this.current.has(source);
			}
			if (intersects && differs) this.#blockers.add(batch);
			else for (const [source, previous] of batch.previous) if (!batch_values.has(source)) batch_values.set(source, previous);
		}
	}
	/**
	*
	* @param {Effect} effect
	*/
	schedule(effect) {
		last_scheduled_effect = effect;
		if (effect.b?.is_pending && (effect.f & 16777228) !== 0 && (effect.f & 32768) === 0) {
			effect.b.defer_effect(effect);
			return;
		}
		var e = effect;
		while (e.parent !== null) {
			e = e.parent;
			var flags = e.f;
			if (collected_effects !== null && e === active_effect) {
				if (async_mode_flag) return;
				if ((active_reaction === null || (active_reaction.f & 2) === 0) && !legacy_is_updating_store) return;
			}
			if ((flags & 96) !== 0) {
				if ((flags & 1024) === 0) return;
				e.f ^= CLEAN;
			}
		}
		this.#roots.push(e);
	}
};
function infinite_loop_guard() {
	if (dev_fallback_default) {
		var updates = /* @__PURE__ */ new Map();
		for (const source of current_batch.current.keys()) for (const [stack, update] of source.updated ?? []) {
			var entry = updates.get(stack);
			if (!entry) {
				entry = {
					error: update.error,
					count: 0
				};
				updates.set(stack, entry);
			}
			entry.count += update.count;
		}
		for (const update of updates.values()) if (update.error) console.error(update.error);
	}
	try {
		effect_update_depth_exceeded();
	} catch (error) {
		if (dev_fallback_default) define_property(error, "stack", { value: "" });
		invoke_error_boundary(error, last_scheduled_effect);
	}
}
/** @type {Set<Effect> | null} */
var eager_block_effects = null;
/**
* @param {Array<Effect>} effects
* @returns {void}
*/
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;
	var i = 0;
	while (i < length) {
		var effect = effects[i++];
		if ((effect.f & 24576) === 0 && is_dirty(effect)) {
			eager_block_effects = /* @__PURE__ */ new Set();
			update_effect(effect);
			if (effect.deps === null && effect.first === null && effect.nodes === null && effect.teardown === null && effect.ac === null) unlink_effect(effect);
			if (eager_block_effects?.size > 0) {
				old_values.clear();
				for (const e of eager_block_effects) {
					if ((e.f & 24576) !== 0) continue;
					/** @type {Effect[]} */
					const ordered_effects = [e];
					let ancestor = e.parent;
					while (ancestor !== null) {
						if (eager_block_effects.has(ancestor)) {
							eager_block_effects.delete(ancestor);
							ordered_effects.push(ancestor);
						}
						ancestor = ancestor.parent;
					}
					for (let j = ordered_effects.length - 1; j >= 0; j--) {
						const e = ordered_effects[j];
						if ((e.f & 24576) !== 0) continue;
						update_effect(e);
					}
				}
				eager_block_effects.clear();
			}
		}
	}
	eager_block_effects = null;
}
/**
* This is similar to `mark_reactions`, but it only marks async/block effects
* depending on `value` and at least one of the other `sources`, so that
* these effects can re-run after another batch has been committed
* @param {Value} value
* @param {Source[]} sources
* @param {Set<Value>} marked
* @param {Map<Reaction, boolean>} checked
*/
function mark_effects(value, sources, marked, checked) {
	if (marked.has(value)) return;
	marked.add(value);
	if (value.reactions !== null) for (const reaction of value.reactions) {
		const flags = reaction.f;
		if ((flags & 2) !== 0) mark_effects(reaction, sources, marked, checked);
		else if ((flags & 4194320) !== 0 && (flags & 2048) === 0 && depends_on(reaction, sources, checked)) {
			set_signal_status(reaction, DIRTY);
			schedule_effect(reaction);
		}
	}
}
/**
* @param {Reaction} reaction
* @param {Source[]} sources
* @param {Map<Reaction, boolean>} checked
*/
function depends_on(reaction, sources, checked) {
	const depends = checked.get(reaction);
	if (depends !== void 0) return depends;
	if (reaction.deps !== null) for (const dep of reaction.deps) {
		if (includes.call(sources, dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on(dep, sources, checked)) {
			checked.set(dep, true);
			return true;
		}
	}
	checked.set(reaction, false);
	return false;
}
/**
* @param {Effect} effect
* @returns {void}
*/
function schedule_effect(effect) {
	/** @type {Batch} */ current_batch.schedule(effect);
}
/**
* Mark all the effects inside a skipped branch CLEAN, so that
* they can be correctly rescheduled later. Tracks dirty and maybe_dirty
* effects so they can be rescheduled if the branch survives.
* @param {Effect} effect
* @param {{ d: Effect[], m: Effect[] }} tracked
*/
function reset_branch(effect, tracked) {
	if ((effect.f & 32) !== 0 && (effect.f & 1024) !== 0) return;
	if ((effect.f & 2048) !== 0) tracked.d.push(effect);
	else if ((effect.f & 4096) !== 0) tracked.m.push(effect);
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_branch(e, tracked);
		e = e.next;
	}
}
/**
* Mark an entire effect tree clean following an error
* @param {Effect} effect
*/
function reset_all(effect) {
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_all(e);
		e = e.next;
	}
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
/**
* Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
* It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
*
* If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
* the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
*
* If `start` returns a cleanup function, it will be called when the effect is destroyed.
*
* If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
* are active, and the returned teardown function will only be called when all effects are destroyed.
*
* It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
*
* ```js
* import { createSubscriber } from 'svelte/reactivity';
* import { on } from 'svelte/events';
*
* export class MediaQuery {
* 	#query;
* 	#subscribe;
*
* 	constructor(query) {
* 		this.#query = window.matchMedia(`(${query})`);
*
* 		this.#subscribe = createSubscriber((update) => {
* 			// when the `change` event occurs, re-run any effects that read `this.current`
* 			const off = on(this.#query, 'change', update);
*
* 			// stop listening when all the effects are destroyed
* 			return () => off();
* 		});
* 	}
*
* 	get current() {
* 		// This makes the getter reactive, if read in an effect
* 		this.#subscribe();
*
* 		// Return the current state of the query, whether or not we're in an effect
* 		return this.#query.matches;
* 	}
* }
* ```
* @param {(update: () => void) => (() => void) | void} start
* @since 5.7.0
*/
function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	/** @type {(() => void) | void} */
	let stop;
	if (dev_fallback_default) tag(version, "createSubscriber version");
	return () => {
		if (effect_tracking()) {
			get(version);
			render_effect(() => {
				if (subscribers === 0) stop = untrack(() => start(() => increment(version)));
				subscribers += 1;
				return () => {
					queue_micro_task(() => {
						subscribers -= 1;
						if (subscribers === 0) {
							stop?.();
							stop = void 0;
							increment(version);
						}
					});
				};
			});
		}
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
/** @import { Effect, Source, TemplateNode, } from '#client' */
/**
* @typedef {{
* 	 onerror?: (error: unknown, reset: () => void) => void;
*   failed?: (anchor: Node, error: () => unknown, reset: () => () => void) => void;
*   pending?: (anchor: Node) => void;
* }} BoundaryProps
*/
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
/**
* @param {TemplateNode} node
* @param {BoundaryProps} props
* @param {((anchor: Node) => void)} children
* @param {((error: unknown) => unknown) | undefined} [transform_error]
* @returns {void}
*/
function boundary(node, props, children, transform_error) {
	new Boundary(node, props, children, transform_error);
}
var Boundary = class {
	/** @type {Boundary | null} */
	parent;
	is_pending = false;
	/**
	* API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
	* Inherited from parent boundary, or defaults to identity.
	* @type {(error: unknown) => unknown}
	*/
	transform_error;
	/** @type {TemplateNode} */
	#anchor;
	/** @type {TemplateNode | null} */
	#hydrate_open = hydrating ? hydrate_node : null;
	/** @type {BoundaryProps} */
	#props;
	/** @type {((anchor: Node) => void)} */
	#children;
	/** @type {Effect} */
	#effect;
	/** @type {Effect | null} */
	#main_effect = null;
	/** @type {Effect | null} */
	#pending_effect = null;
	/** @type {Effect | null} */
	#failed_effect = null;
	/** @type {DocumentFragment | null} */
	#offscreen_fragment = null;
	#local_pending_count = 0;
	#pending_count = 0;
	#pending_count_update_queued = false;
	/** @type {Set<Effect>} */
	#dirty_effects = /* @__PURE__ */ new Set();
	/** @type {Set<Effect>} */
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	/**
	* A source containing the number of pending async deriveds/expressions.
	* Only created if `$effect.pending()` is used inside the boundary,
	* otherwise updating the source results in needless `Batch.ensure()`
	* calls followed by no-op flushes
	* @type {Source<number> | null}
	*/
	#effect_pending = null;
	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#local_pending_count);
		if (dev_fallback_default) tag(this.#effect_pending, "$effect.pending()");
		return () => {
			this.#effect_pending = null;
		};
	});
	/**
	* @param {TemplateNode} node
	* @param {BoundaryProps} props
	* @param {((anchor: Node) => void)} children
	* @param {((error: unknown) => unknown) | undefined} [transform_error]
	*/
	constructor(node, props, children, transform_error) {
		this.#anchor = node;
		this.#props = props;
		this.#children = (anchor) => {
			var effect = active_effect;
			effect.b = this;
			effect.f |= 128;
			children(anchor);
		};
		this.parent = active_effect.b;
		this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
		this.#effect = block(() => {
			if (hydrating) {
				const comment = this.#hydrate_open;
				hydrate_next();
				const server_rendered_pending = comment.data === "[!";
				if (comment.data.startsWith("[?")) {
					const serialized_error = JSON.parse(comment.data.slice(2));
					this.#hydrate_failed_content(serialized_error);
				} else if (server_rendered_pending) this.#hydrate_pending_content();
				else this.#hydrate_resolved_content();
			} else this.#render();
		}, flags);
		if (hydrating) this.#anchor = hydrate_node;
	}
	#hydrate_resolved_content() {
		try {
			this.#main_effect = branch(() => this.#children(this.#anchor));
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {unknown} error The deserialized error from the server's hydration comment
	*/
	#hydrate_failed_content(error) {
		const failed = this.#props.failed;
		if (!failed) return;
		this.#failed_effect = branch(() => {
			failed(this.#anchor, () => error, () => () => {});
		});
	}
	#hydrate_pending_content() {
		const pending = this.#props.pending;
		if (!pending) return;
		this.is_pending = true;
		this.#pending_effect = branch(() => pending(this.#anchor));
		queue_micro_task(() => {
			var fragment = this.#offscreen_fragment = document.createDocumentFragment();
			var anchor = create_text();
			fragment.append(anchor);
			this.#main_effect = this.#run(() => {
				return branch(() => this.#children(anchor));
			});
			if (this.#pending_count === 0) {
				this.#anchor.before(fragment);
				this.#offscreen_fragment = null;
				pause_effect(this.#pending_effect, () => {
					this.#pending_effect = null;
				});
				this.#resolve(current_batch);
			}
		});
	}
	#render() {
		try {
			this.is_pending = this.has_pending_snippet();
			this.#pending_count = 0;
			this.#local_pending_count = 0;
			this.#main_effect = branch(() => {
				this.#children(this.#anchor);
			});
			if (this.#pending_count > 0) {
				var fragment = this.#offscreen_fragment = document.createDocumentFragment();
				move_effect(this.#main_effect, fragment);
				const pending = this.#props.pending;
				this.#pending_effect = branch(() => pending(this.#anchor));
			} else this.#resolve(current_batch);
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {Batch} batch
	*/
	#resolve(batch) {
		this.is_pending = false;
		batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Defer an effect inside a pending boundary until the boundary resolves
	* @param {Effect} effect
	*/
	defer_effect(effect) {
		defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Returns `false` if the effect exists inside a boundary whose pending snippet is shown
	* @returns {boolean}
	*/
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#props.pending;
	}
	/**
	* @template T
	* @param {() => T} fn
	*/
	#run(fn) {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;
		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);
		try {
			Batch.ensure();
			return fn();
		} catch (e) {
			handle_error(e);
			return null;
		} finally {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}
	/**
	* Updates the pending count associated with the currently visible pending snippet,
	* if any, such that we can replace the snippet with content once work is done
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	#update_pending_count(d, batch) {
		if (!this.has_pending_snippet()) {
			if (this.parent) this.parent.#update_pending_count(d, batch);
			return;
		}
		this.#pending_count += d;
		if (this.#pending_count === 0) {
			this.#resolve(batch);
			if (this.#pending_effect) pause_effect(this.#pending_effect, () => {
				this.#pending_effect = null;
			});
			if (this.#offscreen_fragment) {
				this.#anchor.before(this.#offscreen_fragment);
				this.#offscreen_fragment = null;
			}
		}
	}
	/**
	* Update the source that powers `$effect.pending()` inside this boundary,
	* and controls when the current `pending` snippet (if any) is removed.
	* Do not call from inside the class
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	update_pending_count(d, batch) {
		this.#update_pending_count(d, batch);
		this.#local_pending_count += d;
		if (!this.#effect_pending || this.#pending_count_update_queued) return;
		this.#pending_count_update_queued = true;
		queue_micro_task(() => {
			this.#pending_count_update_queued = false;
			if (this.#effect_pending) internal_set(this.#effect_pending, this.#local_pending_count);
		});
	}
	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get(this.#effect_pending);
	}
	/** @param {unknown} error */
	error(error) {
		if (!this.#props.onerror && !this.#props.failed) throw error;
		if (current_batch?.is_fork) {
			if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
			if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
			if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
			current_batch.on_fork_commit(() => {
				this.#handle_error(error);
			});
		} else this.#handle_error(error);
	}
	/**
	* @param {unknown} error
	*/
	#handle_error(error) {
		if (this.#main_effect) {
			destroy_effect(this.#main_effect);
			this.#main_effect = null;
		}
		if (this.#pending_effect) {
			destroy_effect(this.#pending_effect);
			this.#pending_effect = null;
		}
		if (this.#failed_effect) {
			destroy_effect(this.#failed_effect);
			this.#failed_effect = null;
		}
		if (hydrating) {
			set_hydrate_node(this.#hydrate_open);
			next();
			set_hydrate_node(skip_nodes());
		}
		var onerror = this.#props.onerror;
		let failed = this.#props.failed;
		var did_reset = false;
		var calling_on_error = false;
		const reset = () => {
			if (did_reset) {
				svelte_boundary_reset_noop();
				return;
			}
			did_reset = true;
			if (calling_on_error) svelte_boundary_reset_onerror();
			if (this.#failed_effect !== null) pause_effect(this.#failed_effect, () => {
				this.#failed_effect = null;
			});
			this.#run(() => {
				this.#render();
			});
		};
		/** @param {unknown} transformed_error */
		const handle_error_result = (transformed_error) => {
			try {
				calling_on_error = true;
				onerror?.(transformed_error, reset);
				calling_on_error = false;
			} catch (error) {
				invoke_error_boundary(error, this.#effect && this.#effect.parent);
			}
			if (failed) this.#failed_effect = this.#run(() => {
				try {
					return branch(() => {
						var effect = active_effect;
						effect.b = this;
						effect.f |= 128;
						failed(this.#anchor, () => transformed_error, () => reset);
					});
				} catch (error) {
					invoke_error_boundary(error, this.#effect.parent);
					return null;
				}
			});
		};
		queue_micro_task(() => {
			/** @type {unknown} */
			var result;
			try {
				result = this.transform_error(error);
			} catch (e) {
				invoke_error_boundary(e, this.#effect && this.#effect.parent);
				return;
			}
			if (result !== null && typeof result === "object" && typeof result.then === "function")
 /** @type {any} */ result.then(
				handle_error_result,
				/** @param {unknown} e */
				(e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
			);
			else handle_error_result(result);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
/** @import { Blocker, Effect, Value } from '#client' */
/**
* @param {Blocker[]} blockers
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {(values: Value[]) => any} fn
*/
function flatten(blockers, sync, async, fn) {
	const d = is_runes() ? derived : derived_safe_equal;
	var pending = blockers.filter((b) => !b.settled);
	if (async.length === 0 && pending.length === 0) {
		fn(sync.map(d));
		return;
	}
	var parent = active_effect;
	var restore = capture();
	var blocker_promise = pending.length === 1 ? pending[0].promise : pending.length > 1 ? Promise.all(pending.map((b) => b.promise)) : null;
	/** @param {Value[]} values */
	function finish(values) {
		restore();
		try {
			fn(values);
		} catch (error) {
			if ((parent.f & 16384) === 0) invoke_error_boundary(error, parent);
		}
		unset_context();
	}
	if (async.length === 0) {
		/** @type {Promise<any>} */ blocker_promise.then(() => finish(sync.map(d)));
		return;
	}
	var decrement_pending = increment_pending();
	function run() {
		Promise.all(async.map((expression) => /* @__PURE__ */ async_derived(expression))).then((result) => finish([...sync.map(d), ...result])).catch((error) => invoke_error_boundary(error, parent)).finally(() => decrement_pending());
	}
	if (blocker_promise) blocker_promise.then(() => {
		restore();
		run();
		unset_context();
	});
	else run();
}
/**
* Captures the current effect context so that we can restore it after
* some asynchronous work has happened (so that e.g. `await a + b`
* causes `b` to be registered as a dependency).
*/
function capture() {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;
	var previous_batch = current_batch;
	if (dev_fallback_default) var previous_dev_stack = dev_stack;
	return function restore(activate_batch = true) {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);
		if (activate_batch && (previous_effect.f & 16384) === 0) {
			previous_batch?.activate();
			previous_batch?.apply();
		}
		if (dev_fallback_default) {
			set_reactivity_loss_tracker(null);
			set_dev_stack(previous_dev_stack);
		}
	};
}
function unset_context(deactivate_batch = true) {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
	if (deactivate_batch) current_batch?.deactivate();
	if (dev_fallback_default) {
		set_reactivity_loss_tracker(null);
		set_dev_stack(null);
	}
}
/**
* @returns {(skip?: boolean) => void}
*/
function increment_pending() {
	var effect = active_effect;
	var boundary = effect.b;
	var batch = current_batch;
	var blocking = boundary.is_rendered();
	boundary.update_pending_count(1, batch);
	batch.increment(blocking, effect);
	return (skip = false) => {
		boundary.update_pending_count(-1, batch);
		batch.decrement(blocking, effect, skip);
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/deriveds.js
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
/** @import { Batch } from './batch.js'; */
/** @import { Boundary } from '../dom/blocks/boundary.js'; */
/**
* This allows us to track 'reactivity loss' that occurs when signals
* are read after a non-context-restoring `await`. Dev-only
* @type {{ effect: Effect, effect_deps: Set<Value>, warned: boolean } | null}
*/
var reactivity_loss_tracker = null;
/** @param {{ effect: Effect, effect_deps: Set<Value>, warned: boolean } | null} v */
function set_reactivity_loss_tracker(v) {
	reactivity_loss_tracker = v;
}
var recent_async_deriveds = /* @__PURE__ */ new Set();
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/* @__NO_SIDE_EFFECTS__ */
function derived(fn) {
	var flags = 2 | DIRTY;
	if (active_effect !== null) active_effect.f |= EFFECT_PRESERVED;
	/** @type {Derived<V>} */
	const signal = {
		ctx: component_context,
		deps: null,
		effects: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v: UNINITIALIZED,
		wv: 0,
		parent: active_effect,
		ac: null
	};
	if (dev_fallback_default && tracing_mode_flag) signal.created = get_error("created at");
	return signal;
}
/**
* @template V
* @param {() => V | Promise<V>} fn
* @param {string} [label]
* @param {string} [location] If provided, print a warning if the value is not read immediately after update
* @returns {Promise<Source<V>>}
*/
/* @__NO_SIDE_EFFECTS__ */
function async_derived(fn, label, location) {
	let parent = active_effect;
	if (parent === null) async_derived_orphan();
	var promise = void 0;
	var signal = source(UNINITIALIZED);
	if (dev_fallback_default) signal.label = label;
	var should_suspend = !active_reaction;
	/** @type {Map<Batch, ReturnType<typeof deferred<V>>>} */
	var deferreds = /* @__PURE__ */ new Map();
	async_effect(() => {
		var effect = active_effect;
		if (dev_fallback_default) reactivity_loss_tracker = {
			effect,
			effect_deps: /* @__PURE__ */ new Set(),
			warned: false
		};
		/** @type {ReturnType<typeof deferred<V>>} */
		var d = deferred();
		promise = d.promise;
		try {
			Promise.resolve(fn()).then(d.resolve, d.reject).finally(unset_context);
		} catch (error) {
			d.reject(error);
			unset_context();
		}
		if (dev_fallback_default) {
			if (reactivity_loss_tracker) {
				if (effect.deps !== null) for (let i = 0; i < skipped_deps; i += 1) reactivity_loss_tracker.effect_deps.add(effect.deps[i]);
				if (new_deps !== null) for (let i = 0; i < new_deps.length; i += 1) reactivity_loss_tracker.effect_deps.add(new_deps[i]);
			}
			reactivity_loss_tracker = null;
		}
		var batch = current_batch;
		if (should_suspend) {
			if ((effect.f & 32768) !== 0) var decrement_pending = increment_pending();
			if (parent.b.is_rendered()) {
				deferreds.get(batch)?.reject(STALE_REACTION);
				deferreds.delete(batch);
			} else {
				for (const d of deferreds.values()) d.reject(STALE_REACTION);
				deferreds.clear();
			}
			deferreds.set(batch, d);
		}
		/**
		* @param {any} value
		* @param {unknown} error
		*/
		const handler = (value, error = void 0) => {
			if (dev_fallback_default) reactivity_loss_tracker = null;
			if (decrement_pending) decrement_pending(error === STALE_REACTION);
			if (error === STALE_REACTION || (effect.f & 16384) !== 0) return;
			batch.activate();
			if (error) {
				signal.f |= ERROR_VALUE;
				internal_set(signal, error);
			} else {
				if ((signal.f & 8388608) !== 0) signal.f ^= ERROR_VALUE;
				internal_set(signal, value);
				for (const [b, d] of deferreds) {
					deferreds.delete(b);
					if (b === batch) break;
					d.reject(STALE_REACTION);
				}
				if (dev_fallback_default && location !== void 0) {
					recent_async_deriveds.add(signal);
					setTimeout(() => {
						if (recent_async_deriveds.has(signal)) {
							await_waterfall(signal.label, location);
							recent_async_deriveds.delete(signal);
						}
					});
				}
			}
			batch.deactivate();
		};
		d.promise.then(handler, (e) => handler(null, e || "unknown"));
	});
	teardown(() => {
		for (const d of deferreds.values()) d.reject(STALE_REACTION);
	});
	if (dev_fallback_default) signal.f |= ASYNC;
	return new Promise((fulfil) => {
		/** @param {Promise<V>} p */
		function next(p) {
			function go() {
				if (p === promise) fulfil(signal);
				else next(promise);
			}
			p.then(go, go);
		}
		next(promise);
	});
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/* @__NO_SIDE_EFFECTS__ */
function user_derived(fn) {
	const d = /* @__PURE__ */ derived(fn);
	if (!async_mode_flag) push_reaction_value(d);
	return d;
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/* @__NO_SIDE_EFFECTS__ */
function derived_safe_equal(fn) {
	const signal = /* @__PURE__ */ derived(fn);
	signal.equals = safe_equals;
	return signal;
}
/**
* @param {Derived} derived
* @returns {void}
*/
function destroy_derived_effects(derived) {
	var effects = derived.effects;
	if (effects !== null) {
		derived.effects = null;
		for (var i = 0; i < effects.length; i += 1) destroy_effect(effects[i]);
	}
}
/**
* The currently updating deriveds, used to detect infinite recursion
* in dev mode and provide a nicer error than 'too much recursion'
* @type {Derived[]}
*/
var stack = [];
/**
* @template T
* @param {Derived} derived
* @returns {T}
*/
function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;
	var parent = derived.parent;
	if (!is_destroying_effect && parent !== null && (parent.f & 24576) !== 0) {
		derived_inert();
		return derived.v;
	}
	set_active_effect(parent);
	if (dev_fallback_default) {
		let prev_eager_effects = eager_effects;
		set_eager_effects(/* @__PURE__ */ new Set());
		try {
			if (includes.call(stack, derived)) derived_references_self();
			stack.push(derived);
			derived.f &= ~WAS_MARKED;
			destroy_derived_effects(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
			set_eager_effects(prev_eager_effects);
			stack.pop();
		}
	} else try {
		derived.f &= ~WAS_MARKED;
		destroy_derived_effects(derived);
		value = update_reaction(derived);
	} finally {
		set_active_effect(prev_active_effect);
	}
	return value;
}
/**
* @param {Derived} derived
* @returns {void}
*/
function update_derived(derived) {
	var value = execute_derived(derived);
	if (!derived.equals(value)) {
		derived.wv = increment_write_version();
		if (!current_batch?.is_fork || derived.deps === null) {
			if (current_batch !== null) current_batch.capture(derived, value, true);
			else derived.v = value;
			if (derived.deps === null) {
				set_signal_status(derived, CLEAN);
				return;
			}
		}
	}
	if (is_destroying_effect) return;
	if (batch_values !== null) {
		if (effect_tracking() || current_batch?.is_fork) batch_values.set(derived, value);
	} else update_derived_status(derived);
}
/**
* @param {Derived} derived
*/
function freeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) if (e.teardown || e.ac) {
		e.teardown?.();
		e.ac?.abort(STALE_REACTION);
		e.teardown = noop;
		e.ac = null;
		remove_reactions(e, 0);
		destroy_effect_children(e);
	}
}
/**
* @param {Derived} derived
*/
function unfreeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) if (e.teardown) update_effect(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
/** @import { Derived, Effect, Source, Value } from '#client' */
/** @type {Set<any>} */
var eager_effects = /* @__PURE__ */ new Set();
/** @type {Map<Source, any>} */
var old_values = /* @__PURE__ */ new Map();
/**
* @param {Set<any>} v
*/
function set_eager_effects(v) {
	eager_effects = v;
}
var eager_effects_deferred = false;
function set_eager_effects_deferred() {
	eager_effects_deferred = true;
}
/**
* @template V
* @param {V} v
* @param {Error | null} [stack]
* @returns {Source<V>}
*/
function source(v, stack) {
	/** @type {Value} */
	var signal = {
		f: 0,
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};
	if (dev_fallback_default && tracing_mode_flag) {
		signal.created = stack ?? get_error("created at");
		signal.updated = null;
		signal.set_during_effect = false;
		signal.trace = null;
	}
	return signal;
}
/**
* @template V
* @param {V} v
* @param {Error | null} [stack]
*/
/* @__NO_SIDE_EFFECTS__ */
function state(v, stack) {
	const s = source(v, stack);
	push_reaction_value(s);
	return s;
}
/**
* @template V
* @param {V} initial_value
* @param {boolean} [immutable]
* @returns {Source<V>}
*/
/* @__NO_SIDE_EFFECTS__ */
function mutable_source(initial_value, immutable = false, trackable = true) {
	const s = source(initial_value);
	if (!immutable) s.equals = safe_equals;
	if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) (component_context.l.s ??= []).push(s);
	return s;
}
/**
* @template V
* @param {Source<V>} source
* @param {V} value
* @param {boolean} [should_proxy]
* @returns {V}
*/
function set(source, value, should_proxy = false) {
	if (active_reaction !== null && (!untracking || (active_reaction.f & 131072) !== 0) && is_runes() && (active_reaction.f & 4325394) !== 0 && (current_sources === null || !includes.call(current_sources, source))) state_unsafe_mutation();
	let new_value = should_proxy ? proxy(value) : value;
	if (dev_fallback_default) tag_proxy(new_value, source.label);
	return internal_set(source, new_value, legacy_updates);
}
/**
* @template V
* @param {Source<V>} source
* @param {V} value
* @param {Effect[] | null} [updated_during_traversal]
* @returns {V}
*/
function internal_set(source, value, updated_during_traversal = null) {
	if (!source.equals(value)) {
		old_values.set(source, is_destroying_effect ? value : source.v);
		var batch = Batch.ensure();
		batch.capture(source, value);
		if (dev_fallback_default) {
			if (tracing_mode_flag || active_effect !== null) {
				source.updated ??= /* @__PURE__ */ new Map();
				const count = (source.updated.get("")?.count ?? 0) + 1;
				source.updated.set("", {
					error: null,
					count
				});
				if (tracing_mode_flag || count > 5) {
					const error = get_error("updated at");
					if (error !== null) {
						let entry = source.updated.get(error.stack);
						if (!entry) {
							entry = {
								error,
								count: 0
							};
							source.updated.set(error.stack, entry);
						}
						entry.count++;
					}
				}
			}
			if (active_effect !== null) source.set_during_effect = true;
		}
		if ((source.f & 2) !== 0) {
			const derived = source;
			if ((source.f & 2048) !== 0) execute_derived(derived);
			if (batch_values === null) update_derived_status(derived);
		}
		source.wv = increment_write_version();
		mark_reactions(source, DIRTY, updated_during_traversal);
		if (is_runes() && active_effect !== null && (active_effect.f & 1024) !== 0 && (active_effect.f & 96) === 0) if (untracked_writes === null) set_untracked_writes([source]);
		else untracked_writes.push(source);
		if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) flush_eager_effects();
	}
	return value;
}
function flush_eager_effects() {
	eager_effects_deferred = false;
	for (const effect of eager_effects) {
		if ((effect.f & 1024) !== 0) set_signal_status(effect, MAYBE_DIRTY);
		if (is_dirty(effect)) update_effect(effect);
	}
	eager_effects.clear();
}
/**
* @template {number | bigint} T
* @param {Source<T>} source
* @param {1 | -1} [d]
* @returns {T}
*/
function update(source, d = 1) {
	var value = get(source);
	var result = d === 1 ? value++ : value--;
	set(source, value);
	return result;
}
/**
* Silently (without using `get`) increment a source
* @param {Source<number>} source
*/
function increment(source) {
	set(source, source.v + 1);
}
/**
* @param {Value} signal
* @param {number} status should be DIRTY or MAYBE_DIRTY
* @param {Effect[] | null} updated_during_traversal
* @returns {void}
*/
function mark_reactions(signal, status, updated_during_traversal) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	var runes = is_runes();
	var length = reactions.length;
	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;
		if (!runes && reaction === active_effect) continue;
		if (dev_fallback_default && (flags & 131072) !== 0) {
			eager_effects.add(reaction);
			continue;
		}
		var not_dirty = (flags & DIRTY) === 0;
		if (not_dirty) set_signal_status(reaction, status);
		if ((flags & 2) !== 0) {
			var derived = reaction;
			batch_values?.delete(derived);
			if ((flags & 65536) === 0) {
				if (flags & 512) reaction.f |= WAS_MARKED;
				mark_reactions(derived, MAYBE_DIRTY, updated_during_traversal);
			}
		} else if (not_dirty) {
			var effect = reaction;
			if ((flags & 16) !== 0 && eager_block_effects !== null) eager_block_effects.add(effect);
			if (updated_during_traversal !== null) updated_during_traversal.push(effect);
			else schedule_effect(effect);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/proxy.js
/** @import { Source } from '#client' */
var regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
/**
* @template T
* @param {T} value
* @returns {T}
*/
function proxy(value) {
	if (typeof value !== "object" || value === null || STATE_SYMBOL in value) return value;
	const prototype = get_prototype_of(value);
	if (prototype !== object_prototype && prototype !== array_prototype) return value;
	/** @type {Map<any, Source<any>>} */
	var sources = /* @__PURE__ */ new Map();
	var is_proxied_array = is_array(value);
	var version = /* @__PURE__ */ state(0);
	var stack = dev_fallback_default && tracing_mode_flag ? get_error("created at") : null;
	var parent_version = update_version;
	/**
	* Executes the proxy in the context of the reaction it was originally created in, if any
	* @template T
	* @param {() => T} fn
	*/
	var with_parent = (fn) => {
		if (update_version === parent_version) return fn();
		var reaction = active_reaction;
		var version = update_version;
		set_active_reaction(null);
		set_update_version(parent_version);
		var result = fn();
		set_active_reaction(reaction);
		set_update_version(version);
		return result;
	};
	if (is_proxied_array) {
		sources.set("length", /* @__PURE__ */ state(
			/** @type {any[]} */
			value.length,
			stack
		));
		if (dev_fallback_default) value = inspectable_array(value);
	}
	/** Used in dev for $inspect.trace() */
	var path = "";
	let updating = false;
	/** @param {string} new_path */
	function update_path(new_path) {
		if (updating) return;
		updating = true;
		path = new_path;
		tag(version, `${path} version`);
		for (const [prop, source] of sources) tag(source, get_label(path, prop));
		updating = false;
	}
	return new Proxy(value, {
		defineProperty(_, prop, descriptor) {
			if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) state_descriptors_fixed();
			var s = sources.get(prop);
			if (s === void 0) with_parent(() => {
				var s = /* @__PURE__ */ state(descriptor.value, stack);
				sources.set(prop, s);
				if (dev_fallback_default && typeof prop === "string") tag(s, get_label(path, prop));
				return s;
			});
			else set(s, descriptor.value, true);
			return true;
		},
		deleteProperty(target, prop) {
			var s = sources.get(prop);
			if (s === void 0) {
				if (prop in target) {
					const s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
					sources.set(prop, s);
					increment(version);
					if (dev_fallback_default) tag(s, get_label(path, prop));
				}
			} else {
				set(s, UNINITIALIZED);
				increment(version);
			}
			return true;
		},
		get(target, prop, receiver) {
			if (prop === STATE_SYMBOL) return value;
			if (dev_fallback_default && prop === PROXY_PATH_SYMBOL) return update_path;
			var s = sources.get(prop);
			var exists = prop in target;
			if (s === void 0 && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => {
					var s = /* @__PURE__ */ state(proxy(exists ? target[prop] : UNINITIALIZED), stack);
					if (dev_fallback_default) tag(s, get_label(path, prop));
					return s;
				});
				sources.set(prop, s);
			}
			if (s !== void 0) {
				var v = get(s);
				return v === UNINITIALIZED ? void 0 : v;
			}
			return Reflect.get(target, prop, receiver);
		},
		getOwnPropertyDescriptor(target, prop) {
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor && "value" in descriptor) {
				var s = sources.get(prop);
				if (s) descriptor.value = get(s);
			} else if (descriptor === void 0) {
				var source = sources.get(prop);
				var value = source?.v;
				if (source !== void 0 && value !== UNINITIALIZED) return {
					enumerable: true,
					configurable: true,
					value,
					writable: true
				};
			}
			return descriptor;
		},
		has(target, prop) {
			if (prop === STATE_SYMBOL) return true;
			var s = sources.get(prop);
			var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop);
			if (s !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop)?.writable)) {
				if (s === void 0) {
					s = with_parent(() => {
						var s = /* @__PURE__ */ state(has ? proxy(target[prop]) : UNINITIALIZED, stack);
						if (dev_fallback_default) tag(s, get_label(path, prop));
						return s;
					});
					sources.set(prop, s);
				}
				if (get(s) === UNINITIALIZED) return false;
			}
			return has;
		},
		set(target, prop, value, receiver) {
			var s = sources.get(prop);
			var has = prop in target;
			if (is_proxied_array && prop === "length") for (var i = value; i < s.v; i += 1) {
				var other_s = sources.get(i + "");
				if (other_s !== void 0) set(other_s, UNINITIALIZED);
				else if (i in target) {
					other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
					sources.set(i + "", other_s);
					if (dev_fallback_default) tag(other_s, get_label(path, i));
				}
			}
			if (s === void 0) {
				if (!has || get_descriptor(target, prop)?.writable) {
					s = with_parent(() => /* @__PURE__ */ state(void 0, stack));
					if (dev_fallback_default) tag(s, get_label(path, prop));
					set(s, proxy(value));
					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;
				var p = with_parent(() => proxy(value));
				set(s, p);
			}
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor?.set) descriptor.set.call(receiver, value);
			if (!has) {
				if (is_proxied_array && typeof prop === "string") {
					var ls = sources.get("length");
					var n = Number(prop);
					if (Number.isInteger(n) && n >= ls.v) set(ls, n + 1);
				}
				increment(version);
			}
			return true;
		},
		ownKeys(target) {
			get(version);
			var own_keys = Reflect.ownKeys(target).filter((key) => {
				var source = sources.get(key);
				return source === void 0 || source.v !== UNINITIALIZED;
			});
			for (var [key, source] of sources) if (source.v !== UNINITIALIZED && !(key in target)) own_keys.push(key);
			return own_keys;
		},
		setPrototypeOf() {
			state_prototype_fixed();
		}
	});
}
/**
* @param {string} path
* @param {string | symbol} prop
*/
function get_label(path, prop) {
	if (typeof prop === "symbol") return `${path}[Symbol(${prop.description ?? ""})]`;
	if (regex_is_valid_identifier.test(prop)) return `${path}.${prop}`;
	return /^\d+$/.test(prop) ? `${path}[${prop}]` : `${path}['${prop}']`;
}
/**
* @param {any} value
*/
function get_proxied_value(value) {
	try {
		if (value !== null && typeof value === "object" && STATE_SYMBOL in value) return value[STATE_SYMBOL];
	} catch {}
	return value;
}
/**
* @param {any} a
* @param {any} b
*/
function is(a, b) {
	return Object.is(get_proxied_value(a), get_proxied_value(b));
}
var ARRAY_MUTATING_METHODS = new Set([
	"copyWithin",
	"fill",
	"pop",
	"push",
	"reverse",
	"shift",
	"sort",
	"splice",
	"unshift"
]);
/**
* Wrap array mutating methods so $inspect is triggered only once and
* to prevent logging an array in intermediate state (e.g. with an empty slot)
* @param {any[]} array
*/
function inspectable_array(array) {
	return new Proxy(array, { get(target, prop, receiver) {
		var value = Reflect.get(target, prop, receiver);
		if (!ARRAY_MUTATING_METHODS.has(prop)) return value;
		/**
		* @this {any[]}
		* @param {any[]} args
		*/
		return function(...args) {
			set_eager_effects_deferred();
			var result = value.apply(this, args);
			flush_eager_effects();
			return result;
		};
	} });
}
//#endregion
//#region node_modules/svelte/src/internal/client/dev/equality.js
function init_array_prototype_warnings() {
	const array_prototype = Array.prototype;
	const cleanup = Array.__svelte_cleanup;
	if (cleanup) cleanup();
	const { indexOf, lastIndexOf, includes } = array_prototype;
	array_prototype.indexOf = function(item, from_index) {
		const index = indexOf.call(this, item, from_index);
		if (index === -1) {
			for (let i = from_index ?? 0; i < this.length; i += 1) if (get_proxied_value(this[i]) === item) {
				state_proxy_equality_mismatch("array.indexOf(...)");
				break;
			}
		}
		return index;
	};
	array_prototype.lastIndexOf = function(item, from_index) {
		const index = lastIndexOf.call(this, item, from_index ?? this.length - 1);
		if (index === -1) {
			for (let i = 0; i <= (from_index ?? this.length - 1); i += 1) if (get_proxied_value(this[i]) === item) {
				state_proxy_equality_mismatch("array.lastIndexOf(...)");
				break;
			}
		}
		return index;
	};
	array_prototype.includes = function(item, from_index) {
		const has = includes.call(this, item, from_index);
		if (!has) {
			for (let i = 0; i < this.length; i += 1) if (get_proxied_value(this[i]) === item) {
				state_proxy_equality_mismatch("array.includes(...)");
				break;
			}
		}
		return has;
	};
	Array.__svelte_cleanup = () => {
		array_prototype.indexOf = indexOf;
		array_prototype.lastIndexOf = lastIndexOf;
		array_prototype.includes = includes;
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/operations.js
/** @import { Effect, TemplateNode } from '#client' */
/** @type {Window} */
var $window;
/** @type {boolean} */
var is_firefox;
/** @type {() => Node | null} */
var first_child_getter;
/** @type {() => Node | null} */
var next_sibling_getter;
/**
* Initialize these lazily to avoid issues when using the runtime in a server context
* where these globals are not available while avoiding a separate server entry point
*/
function init_operations() {
	if ($window !== void 0) return;
	$window = window;
	is_firefox = /Firefox/.test(navigator.userAgent);
	var element_prototype = Element.prototype;
	var node_prototype = Node.prototype;
	var text_prototype = Text.prototype;
	first_child_getter = get_descriptor(node_prototype, "firstChild").get;
	next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
	if (is_extensible(element_prototype)) {
		element_prototype.__click = void 0;
		element_prototype.__className = void 0;
		element_prototype.__attributes = null;
		element_prototype.__style = void 0;
		element_prototype.__e = void 0;
	}
	if (is_extensible(text_prototype)) text_prototype.__t = void 0;
	if (dev_fallback_default) {
		element_prototype.__svelte_meta = null;
		init_array_prototype_warnings();
	}
}
/**
* @param {string} value
* @returns {Text}
*/
function create_text(value = "") {
	return document.createTextNode(value);
}
/**
* @template {Node} N
* @param {N} node
*/
/* @__NO_SIDE_EFFECTS__ */
function get_first_child(node) {
	return first_child_getter.call(node);
}
/**
* @template {Node} N
* @param {N} node
*/
/* @__NO_SIDE_EFFECTS__ */
function get_next_sibling(node) {
	return next_sibling_getter.call(node);
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @template {Node} N
* @param {N} node
* @param {boolean} is_text
* @returns {TemplateNode | null}
*/
function child(node, is_text) {
	if (!hydrating) return /* @__PURE__ */ get_first_child(node);
	var child = /* @__PURE__ */ get_first_child(hydrate_node);
	if (child === null) child = hydrate_node.appendChild(create_text());
	else if (is_text && child.nodeType !== 3) {
		var text = create_text();
		child?.before(text);
		set_hydrate_node(text);
		return text;
	}
	if (is_text) merge_text_nodes(child);
	set_hydrate_node(child);
	return child;
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {TemplateNode} node
* @param {number} count
* @param {boolean} is_text
* @returns {TemplateNode | null}
*/
function sibling(node, count = 1, is_text = false) {
	let next_sibling = hydrating ? hydrate_node : node;
	var last_sibling;
	while (count--) {
		last_sibling = next_sibling;
		next_sibling = /* @__PURE__ */ get_next_sibling(next_sibling);
	}
	if (!hydrating) return next_sibling;
	if (is_text) {
		if (next_sibling?.nodeType !== 3) {
			var text = create_text();
			if (next_sibling === null) last_sibling?.after(text);
			else next_sibling.before(text);
			set_hydrate_node(text);
			return text;
		}
		merge_text_nodes(next_sibling);
	}
	set_hydrate_node(next_sibling);
	return next_sibling;
}
/**
* @template {Node} N
* @param {N} node
* @returns {void}
*/
function clear_text_content(node) {
	node.textContent = "";
}
/**
* Returns `true` if we're updating the current block, for example `condition` in
* an `{#if condition}` block just changed. In this case, the branch should be
* appended (or removed) at the same time as other updates within the
* current `<svelte:boundary>`
*/
function should_defer_append() {
	if (!async_mode_flag) return false;
	if (eager_block_effects !== null) return false;
	return (active_effect.f & REACTION_RAN) !== 0;
}
/**
* @template {keyof HTMLElementTagNameMap | string} T
* @param {T} tag
* @param {string} [namespace]
* @param {string} [is]
* @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element}
*/
function create_element(tag, namespace, is) {
	let options = is ? { is } : void 0;
	return document.createElementNS(namespace ?? "http://www.w3.org/1999/xhtml", tag, options);
}
/**
* Browsers split text nodes larger than 65536 bytes when parsing.
* For hydration to succeed, we need to stitch them back together
* @param {Text} text
*/
function merge_text_nodes(text) {
	if (text.nodeValue.length < 65536) return;
	let next = text.nextSibling;
	while (next !== null && next.nodeType === 3) {
		next.remove();
		/** @type {string} */ text.nodeValue += next.nodeValue;
		next = text.nextSibling;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
/**
* @template T
* @param {() => T} fn
*/
function without_reactive_context(fn) {
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		return fn();
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
/** @import { Blocker, ComponentContext, ComponentContextLegacy, Derived, Effect, TemplateNode, TransitionManager } from '#client' */
/**
* @param {'$effect' | '$effect.pre' | '$inspect'} rune
*/
function validate_effect(rune) {
	if (active_effect === null) {
		if (active_reaction === null) effect_orphan(rune);
		effect_in_unowned_derived();
	}
	if (is_destroying_effect) effect_in_teardown(rune);
}
/**
* @param {Effect} effect
* @param {Effect} parent_effect
*/
function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) parent_effect.last = parent_effect.first = effect;
	else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}
/**
* @param {number} type
* @param {null | (() => void | (() => void))} fn
* @returns {Effect}
*/
function create_effect(type, fn) {
	var parent = active_effect;
	if (dev_fallback_default) while (parent !== null && (parent.f & 131072) !== 0) parent = parent.parent;
	if (parent !== null && (parent.f & 8192) !== 0) type |= INERT;
	/** @type {Effect} */
	var effect = {
		ctx: component_context,
		deps: null,
		nodes: null,
		f: type | DIRTY | 512,
		first: null,
		fn,
		last: null,
		next: null,
		parent,
		b: parent && parent.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	if (dev_fallback_default) effect.component_function = dev_current_component_function;
	current_batch?.register_created_effect(effect);
	/** @type {Effect | null} */
	var e = effect;
	if ((type & 4) !== 0) if (collected_effects !== null) collected_effects.push(effect);
	else Batch.ensure().schedule(effect);
	else if (fn !== null) {
		try {
			update_effect(effect);
		} catch (e) {
			destroy_effect(effect);
			throw e;
		}
		if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && (e.f & 524288) === 0) {
			e = e.first;
			if ((type & 16) !== 0 && (type & 65536) !== 0 && e !== null) e.f |= EFFECT_TRANSPARENT;
		}
	}
	if (e !== null) {
		e.parent = parent;
		if (parent !== null) push_effect(e, parent);
		if (active_reaction !== null && (active_reaction.f & 2) !== 0 && (type & 64) === 0) {
			var derived = active_reaction;
			(derived.effects ??= []).push(e);
		}
	}
	return effect;
}
/**
* Internal representation of `$effect.tracking()`
* @returns {boolean}
*/
function effect_tracking() {
	return active_reaction !== null && !untracking;
}
/**
* @param {() => void} fn
*/
function teardown(fn) {
	const effect = create_effect(8, null);
	set_signal_status(effect, CLEAN);
	effect.teardown = fn;
	return effect;
}
/**
* Internal representation of `$effect(...)`
* @param {() => void | (() => void)} fn
*/
function user_effect(fn) {
	validate_effect("$effect");
	if (dev_fallback_default) define_property(fn, "name", { value: "$effect" });
	var flags = active_effect.f;
	if (!active_reaction && (flags & 32) !== 0 && (flags & 32768) === 0) {
		var context = component_context;
		(context.e ??= []).push(fn);
	} else return create_user_effect(fn);
}
/**
* @param {() => void | (() => void)} fn
*/
function create_user_effect(fn) {
	return create_effect(4 | USER_EFFECT, fn);
}
/**
* An effect root whose children can transition out
* @param {() => void} fn
* @returns {(options?: { outro?: boolean }) => Promise<void>}
*/
function component_root(fn) {
	Batch.ensure();
	const effect = create_effect(64 | EFFECT_PRESERVED, fn);
	return (options = {}) => {
		return new Promise((fulfil) => {
			if (options.outro) pause_effect(effect, () => {
				destroy_effect(effect);
				fulfil(void 0);
			});
			else {
				destroy_effect(effect);
				fulfil(void 0);
			}
		});
	};
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function effect(fn) {
	return create_effect(4, fn);
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function async_effect(fn) {
	return create_effect(ASYNC | EFFECT_PRESERVED, fn);
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function render_effect(fn, flags = 0) {
	return create_effect(8 | flags, fn);
}
/**
* @param {(...expressions: any) => void | (() => void)} fn
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {Blocker[]} blockers
*/
function template_effect(fn, sync = [], async = [], blockers = []) {
	flatten(blockers, sync, async, (values) => {
		create_effect(8, () => fn(...values.map(get)));
	});
}
/**
* @param {(() => void)} fn
* @param {number} flags
*/
function block(fn, flags = 0) {
	var effect = create_effect(16 | flags, fn);
	if (dev_fallback_default) effect.dev_stack = dev_stack;
	return effect;
}
/**
* @param {(() => void)} fn
*/
function branch(fn) {
	return create_effect(32 | EFFECT_PRESERVED, fn);
}
/**
* @param {Effect} effect
*/
function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
	}
}
/**
* @param {Effect} signal
* @param {boolean} remove_dom
* @returns {void}
*/
function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;
	while (effect !== null) {
		const controller = effect.ac;
		if (controller !== null) without_reactive_context(() => {
			controller.abort(STALE_REACTION);
		});
		var next = effect.next;
		if ((effect.f & 64) !== 0) effect.parent = null;
		else destroy_effect(effect, remove_dom);
		effect = next;
	}
}
/**
* @param {Effect} signal
* @returns {void}
*/
function destroy_block_effect_children(signal) {
	var effect = signal.first;
	while (effect !== null) {
		var next = effect.next;
		if ((effect.f & 32) === 0) destroy_effect(effect);
		effect = next;
	}
}
/**
* @param {Effect} effect
* @param {boolean} [remove_dom]
* @returns {void}
*/
function destroy_effect(effect, remove_dom = true) {
	var removed = false;
	if ((remove_dom || (effect.f & 262144) !== 0) && effect.nodes !== null && effect.nodes.end !== null) {
		remove_effect_dom(effect.nodes.start, effect.nodes.end);
		removed = true;
	}
	set_signal_status(effect, DESTROYING);
	destroy_effect_children(effect, remove_dom && !removed);
	remove_reactions(effect, 0);
	var transitions = effect.nodes && effect.nodes.t;
	if (transitions !== null) for (const transition of transitions) transition.stop();
	execute_effect_teardown(effect);
	effect.f ^= DESTROYING;
	effect.f |= DESTROYED;
	var parent = effect.parent;
	if (parent !== null && parent.first !== null) unlink_effect(effect);
	if (dev_fallback_default) effect.component_function = null;
	effect.next = effect.prev = effect.teardown = effect.ctx = effect.deps = effect.fn = effect.nodes = effect.ac = effect.b = null;
}
/**
*
* @param {TemplateNode | null} node
* @param {TemplateNode} end
*/
function remove_effect_dom(node, end) {
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		node.remove();
		node = next;
	}
}
/**
* Detach an effect from the effect tree, freeing up memory and
* reducing the amount of work that happens on subsequent traversals
* @param {Effect} effect
*/
function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next = effect.next;
	if (prev !== null) prev.next = next;
	if (next !== null) next.prev = prev;
	if (parent !== null) {
		if (parent.first === effect) parent.first = next;
		if (parent.last === effect) parent.last = prev;
	}
}
/**
* When a block effect is removed, we don't immediately destroy it or yank it
* out of the DOM, because it might have transitions. Instead, we 'pause' it.
* It stays around (in memory, and in the DOM) until outro transitions have
* completed, and if the state change is reversed then we _resume_ it.
* A paused effect does not update, and the DOM subtree becomes inert.
* @param {Effect} effect
* @param {() => void} [callback]
* @param {boolean} [destroy]
*/
function pause_effect(effect, callback, destroy = true) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	pause_children(effect, transitions, true);
	var fn = () => {
		if (destroy) destroy_effect(effect);
		if (callback) callback();
	};
	var remaining = transitions.length;
	if (remaining > 0) {
		var check = () => --remaining || fn();
		for (var transition of transitions) transition.out(check);
	} else fn();
}
/**
* @param {Effect} effect
* @param {TransitionManager[]} transitions
* @param {boolean} local
*/
function pause_children(effect, transitions, local) {
	if ((effect.f & 8192) !== 0) return;
	effect.f ^= INERT;
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transitions.push(transition);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		if ((child.f & 64) === 0) {
			var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0 && (effect.f & 16) !== 0;
			pause_children(child, transitions, transparent ? local : false);
		}
		child = sibling;
	}
}
/**
* The opposite of `pause_effect`. We call this if (for example)
* `x` becomes falsy then truthy: `{#if x}...{/if}`
* @param {Effect} effect
*/
function resume_effect(effect) {
	resume_children(effect, true);
}
/**
* @param {Effect} effect
* @param {boolean} local
*/
function resume_children(effect, local) {
	if ((effect.f & 8192) === 0) return;
	effect.f ^= INERT;
	if ((effect.f & 1024) === 0) {
		set_signal_status(effect, DIRTY);
		Batch.ensure().schedule(effect);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0;
		resume_children(child, transparent ? local : false);
		child = sibling;
	}
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transition.in();
	}
}
/**
* @param {Effect} effect
* @param {DocumentFragment} fragment
*/
function move_effect(effect, fragment) {
	if (!effect.nodes) return;
	/** @type {TemplateNode | null} */
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		fragment.append(node);
		node = next;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
/**
* @type {Set<Value> | null}
* @deprecated
*/
var captured_signals = null;
//#endregion
//#region node_modules/svelte/src/internal/client/runtime.js
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
var is_updating_effect = false;
var is_destroying_effect = false;
/** @param {boolean} value */
function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}
/** @type {null | Reaction} */
var active_reaction = null;
var untracking = false;
/** @param {null | Reaction} reaction */
function set_active_reaction(reaction) {
	active_reaction = reaction;
}
/** @type {null | Effect} */
var active_effect = null;
/** @param {null | Effect} effect */
function set_active_effect(effect) {
	active_effect = effect;
}
/**
* When sources are created within a reaction, reading and writing
* them within that reaction should not cause a re-run
* @type {null | Source[]}
*/
var current_sources = null;
/** @param {Value} value */
function push_reaction_value(value) {
	if (active_reaction !== null && (!async_mode_flag || (active_reaction.f & 2) !== 0)) if (current_sources === null) current_sources = [value];
	else current_sources.push(value);
}
/**
* The dependencies of the reaction that is currently being executed. In many cases,
* the dependencies are unchanged between runs, and so this will be `null` unless
* and until a new dependency is accessed — we track this via `skipped_deps`
* @type {null | Value[]}
*/
var new_deps = null;
var skipped_deps = 0;
/**
* Tracks writes that the effect it's executed in doesn't listen to yet,
* so that the dependency can be added to the effect later on if it then reads it
* @type {null | Source[]}
*/
var untracked_writes = null;
/** @param {null | Source[]} value */
function set_untracked_writes(value) {
	untracked_writes = value;
}
/**
* @type {number} Used by sources and deriveds for handling updates.
* Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
**/
var write_version = 1;
/** @type {number} Used to version each read of a source of derived to avoid duplicating depedencies inside a reaction */
var read_version = 0;
var update_version = read_version;
/** @param {number} value */
function set_update_version(value) {
	update_version = value;
}
function increment_write_version() {
	return ++write_version;
}
/**
* Determines whether a derived or effect is dirty.
* If it is MAYBE_DIRTY, will set the status to CLEAN
* @param {Reaction} reaction
* @returns {boolean}
*/
function is_dirty(reaction) {
	var flags = reaction.f;
	if ((flags & 2048) !== 0) return true;
	if (flags & 2) reaction.f &= ~WAS_MARKED;
	if ((flags & 4096) !== 0) {
		var dependencies = reaction.deps;
		var length = dependencies.length;
		for (var i = 0; i < length; i++) {
			var dependency = dependencies[i];
			if (is_dirty(dependency)) update_derived(dependency);
			if (dependency.wv > reaction.wv) return true;
		}
		if ((flags & 512) !== 0 && batch_values === null) set_signal_status(reaction, CLEAN);
	}
	return false;
}
/**
* @param {Value} signal
* @param {Effect} effect
* @param {boolean} [root]
*/
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	if (!async_mode_flag && current_sources !== null && includes.call(current_sources, signal)) return;
	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];
		if ((reaction.f & 2) !== 0) schedule_possible_effect_self_invalidation(reaction, effect, false);
		else if (effect === reaction) {
			if (root) set_signal_status(reaction, DIRTY);
			else if ((reaction.f & 1024) !== 0) set_signal_status(reaction, MAYBE_DIRTY);
			schedule_effect(reaction);
		}
	}
}
/** @param {Reaction} reaction */
function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;
	var flags = reaction.f;
	new_deps = null;
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags & 96) === 0 ? reaction : null;
	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;
	if (reaction.ac !== null) {
		without_reactive_context(() => {
			/** @type {AbortController} */ reaction.ac.abort(STALE_REACTION);
		});
		reaction.ac = null;
	}
	try {
		reaction.f |= REACTION_IS_UPDATING;
		var fn = reaction.fn;
		var result = fn();
		reaction.f |= REACTION_RAN;
		var deps = reaction.deps;
		var is_fork = current_batch?.is_fork;
		if (new_deps !== null) {
			var i;
			if (!is_fork) remove_reactions(reaction, skipped_deps);
			if (deps !== null && skipped_deps > 0) {
				deps.length = skipped_deps + new_deps.length;
				for (i = 0; i < new_deps.length; i++) deps[skipped_deps + i] = new_deps[i];
			} else reaction.deps = deps = new_deps;
			if (effect_tracking() && (reaction.f & 512) !== 0) for (i = skipped_deps; i < deps.length; i++) (deps[i].reactions ??= []).push(reaction);
		} else if (!is_fork && deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}
		if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & 6146) === 0) for (i = 0; i < untracked_writes.length; i++) schedule_possible_effect_self_invalidation(untracked_writes[i], reaction);
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;
			if (previous_reaction.deps !== null) for (let i = 0; i < previous_skipped_deps; i += 1) previous_reaction.deps[i].rv = read_version;
			if (previous_deps !== null) for (const dep of previous_deps) dep.rv = read_version;
			if (untracked_writes !== null) if (previous_untracked_writes === null) previous_untracked_writes = untracked_writes;
			else previous_untracked_writes.push(...untracked_writes);
		}
		if ((reaction.f & 8388608) !== 0) reaction.f ^= ERROR_VALUE;
		return result;
	} catch (error) {
		return handle_error(error);
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}
/**
* @template V
* @param {Reaction} signal
* @param {Value<V>} dependency
* @returns {void}
*/
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) reactions = dependency.reactions = null;
			else {
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}
	if (reactions === null && (dependency.f & 2) !== 0 && (new_deps === null || !includes.call(new_deps, dependency))) {
		var derived = dependency;
		if ((derived.f & 512) !== 0) {
			derived.f ^= 512;
			derived.f &= ~WAS_MARKED;
		}
		if (derived.v !== UNINITIALIZED) update_derived_status(derived);
		freeze_derived_effects(derived);
		remove_reactions(derived, 0);
	}
}
/**
* @param {Reaction} signal
* @param {number} start_index
* @returns {void}
*/
function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;
	for (var i = start_index; i < dependencies.length; i++) remove_reaction(signal, dependencies[i]);
}
/**
* @param {Effect} effect
* @returns {void}
*/
function update_effect(effect) {
	var flags = effect.f;
	if ((flags & 16384) !== 0) return;
	set_signal_status(effect, CLEAN);
	var previous_effect = active_effect;
	var was_updating_effect = is_updating_effect;
	active_effect = effect;
	is_updating_effect = true;
	if (dev_fallback_default) {
		var previous_component_fn = dev_current_component_function;
		set_dev_current_component_function(effect.component_function);
		var previous_stack = dev_stack;
		set_dev_stack(effect.dev_stack ?? dev_stack);
	}
	try {
		if ((flags & 16777232) !== 0) destroy_block_effect_children(effect);
		else destroy_effect_children(effect);
		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === "function" ? teardown : null;
		effect.wv = write_version;
		if (dev_fallback_default && tracing_mode_flag && (effect.f & 2048) !== 0 && effect.deps !== null) {
			for (var dep of effect.deps) if (dep.set_during_effect) {
				dep.wv = increment_write_version();
				dep.set_during_effect = false;
			}
		}
	} finally {
		is_updating_effect = was_updating_effect;
		active_effect = previous_effect;
		if (dev_fallback_default) {
			set_dev_current_component_function(previous_component_fn);
			set_dev_stack(previous_stack);
		}
	}
}
/**
* @template V
* @param {Value<V>} signal
* @returns {V}
*/
function get(signal) {
	var is_derived = (signal.f & 2) !== 0;
	captured_signals?.add(signal);
	if (active_reaction !== null && !untracking) {
		if (!(active_effect !== null && (active_effect.f & 16384) !== 0) && (current_sources === null || !includes.call(current_sources, signal))) {
			var deps = active_reaction.deps;
			if ((active_reaction.f & 2097152) !== 0) {
				if (signal.rv < read_version) {
					signal.rv = read_version;
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) skipped_deps++;
					else if (new_deps === null) new_deps = [signal];
					else new_deps.push(signal);
				}
			} else {
				(active_reaction.deps ??= []).push(signal);
				var reactions = signal.reactions;
				if (reactions === null) signal.reactions = [active_reaction];
				else if (!includes.call(reactions, active_reaction)) reactions.push(active_reaction);
			}
		}
	}
	if (dev_fallback_default) {
		if (!untracking && reactivity_loss_tracker && !reactivity_loss_tracker.warned && (reactivity_loss_tracker.effect.f & 2097152) === 0 && !reactivity_loss_tracker.effect_deps.has(signal)) {
			reactivity_loss_tracker.warned = true;
			await_reactivity_loss(signal.label);
			var trace = get_error("traced at");
			if (trace) console.warn(trace);
		}
		recent_async_deriveds.delete(signal);
		if (tracing_mode_flag && !untracking && tracing_expressions !== null && active_reaction !== null && tracing_expressions.reaction === active_reaction) if (signal.trace) signal.trace();
		else {
			trace = get_error("traced at");
			if (trace) {
				var entry = tracing_expressions.entries.get(signal);
				if (entry === void 0) {
					entry = { traces: [] };
					tracing_expressions.entries.set(signal, entry);
				}
				var last = entry.traces[entry.traces.length - 1];
				if (trace.stack !== last?.stack) entry.traces.push(trace);
			}
		}
	}
	if (is_destroying_effect && old_values.has(signal)) return old_values.get(signal);
	if (is_derived) {
		var derived = signal;
		if (is_destroying_effect) {
			var value = derived.v;
			if ((derived.f & 1024) === 0 && derived.reactions !== null || depends_on_old_values(derived)) value = execute_derived(derived);
			old_values.set(derived, value);
			return value;
		}
		var should_connect = (derived.f & 512) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & 512) !== 0);
		var is_new = (derived.f & REACTION_RAN) === 0;
		if (is_dirty(derived)) {
			if (should_connect) derived.f |= 512;
			update_derived(derived);
		}
		if (should_connect && !is_new) {
			unfreeze_derived_effects(derived);
			reconnect(derived);
		}
	}
	if (batch_values?.has(signal)) return batch_values.get(signal);
	if ((signal.f & 8388608) !== 0) throw signal.v;
	return signal.v;
}
/**
* (Re)connect a disconnected derived, so that it is notified
* of changes in `mark_reactions`
* @param {Derived} derived
*/
function reconnect(derived) {
	derived.f |= 512;
	if (derived.deps === null) return;
	for (const dep of derived.deps) {
		(dep.reactions ??= []).push(derived);
		if ((dep.f & 2) !== 0 && (dep.f & 512) === 0) {
			unfreeze_derived_effects(dep);
			reconnect(dep);
		}
	}
}
/** @param {Derived} derived */
function depends_on_old_values(derived) {
	if (derived.v === UNINITIALIZED) return true;
	if (derived.deps === null) return false;
	for (const dep of derived.deps) {
		if (old_values.has(dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on_old_values(dep)) return true;
	}
	return false;
}
/**
* When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
* any state read inside `fn` will not be treated as a dependency.
*
* ```ts
* $effect(() => {
*   // this will run when `data` changes, but not when `time` changes
*   save(data, {
*     timestamp: untrack(() => time)
*   });
* });
* ```
* @template T
* @param {() => T} fn
* @returns {T}
*/
function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}
/**
* Subset of delegated events which should be passive by default.
* These two are already passive via browser defaults on window, document and body.
* But since
* - we're delegating them
* - they happen often
* - they apply to mobile which is generally less performant
* we're marking them as passive by default for other elements, too.
*/
var PASSIVE_EVENTS = ["touchstart", "touchmove"];
/**
* Returns `true` if `name` is a passive event
* @param {string} name
*/
function is_passive_event(name) {
	return PASSIVE_EVENTS.includes(name);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
/**
* Used on elements, as a map of event type -> event handler,
* and on events themselves to track which element handled an event
*/
var event_symbol = Symbol("events");
/** @type {Set<string>} */
var all_registered_events = /* @__PURE__ */ new Set();
/** @type {Set<(events: Array<string>) => void>} */
var root_event_handles = /* @__PURE__ */ new Set();
/**
* @param {string} event_name
* @param {EventTarget} dom
* @param {EventListener} [handler]
* @param {AddEventListenerOptions} [options]
*/
function create_event(event_name, dom, handler, options = {}) {
	/**
	* @this {EventTarget}
	*/
	function target_handler(event) {
		if (!options.capture) handle_event_propagation.call(dom, event);
		if (!event.cancelBubble) return without_reactive_context(() => {
			return handler?.call(this, event);
		});
	}
	if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") queue_micro_task(() => {
		dom.addEventListener(event_name, target_handler, options);
	});
	else dom.addEventListener(event_name, target_handler, options);
	return target_handler;
}
/**
* @param {string} event_name
* @param {Element} dom
* @param {EventListener} [handler]
* @param {boolean} [capture]
* @param {boolean} [passive]
* @returns {void}
*/
function event(event_name, dom, handler, capture, passive) {
	var options = {
		capture,
		passive
	};
	var target_handler = create_event(event_name, dom, handler, options);
	if (dom === document.body || dom === window || dom === document || dom instanceof HTMLMediaElement) teardown(() => {
		dom.removeEventListener(event_name, target_handler, options);
	});
}
/**
* @param {string} event_name
* @param {Element} element
* @param {EventListener} [handler]
* @returns {void}
*/
function delegated(event_name, element, handler) {
	(element[event_symbol] ??= {})[event_name] = handler;
}
/**
* @param {Array<string>} events
* @returns {void}
*/
function delegate(events) {
	for (var i = 0; i < events.length; i++) all_registered_events.add(events[i]);
	for (var fn of root_event_handles) fn(events);
}
var last_propagated_event = null;
/**
* @this {EventTarget}
* @param {Event} event
* @returns {void}
*/
function handle_event_propagation(event) {
	var handler_element = this;
	var owner_document = handler_element.ownerDocument;
	var event_name = event.type;
	var path = event.composedPath?.() || [];
	var current_target = path[0] || event.target;
	last_propagated_event = event;
	var path_idx = 0;
	var handled_at = last_propagated_event === event && event[event_symbol];
	if (handled_at) {
		var at_idx = path.indexOf(handled_at);
		if (at_idx !== -1 && (handler_element === document || handler_element === window)) {
			event[event_symbol] = handler_element;
			return;
		}
		var handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) return;
		if (at_idx <= handler_idx) path_idx = at_idx;
	}
	current_target = path[path_idx] || event.target;
	if (current_target === handler_element) return;
	define_property(event, "currentTarget", {
		configurable: true,
		get() {
			return current_target || owner_document;
		}
	});
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		/**
		* @type {unknown}
		*/
		var throw_error;
		/**
		* @type {unknown[]}
		*/
		var other_errors = [];
		while (current_target !== null) {
			/** @type {null | Element} */
			var parent_element = current_target.assignedSlot || current_target.parentNode || current_target.host || null;
			try {
				var delegated = current_target[event_symbol]?.[event_name];
				if (delegated != null && (!current_target.disabled || event.target === current_target)) delegated.call(current_target, event);
			} catch (error) {
				if (throw_error) other_errors.push(error);
				else throw_error = error;
			}
			if (event.cancelBubble || parent_element === handler_element || parent_element === null) break;
			current_target = parent_element;
		}
		if (throw_error) {
			for (let error of other_errors) queueMicrotask(() => {
				throw error;
			});
			throw throw_error;
		}
	} finally {
		event[event_symbol] = handler_element;
		delete event.currentTarget;
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var policy = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (html) => {
	return html;
} });
/** @param {string} html */
function create_trusted_html(html) {
	return policy?.createHTML(html) ?? html;
}
/**
* @param {string} html
*/
function create_fragment_from_html(html) {
	var elem = create_element("template");
	elem.innerHTML = create_trusted_html(html.replaceAll("<!>", "<!---->"));
	return elem.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
/** @import { TemplateStructure } from './types' */
/**
* @param {TemplateNode} start
* @param {TemplateNode | null} end
*/
function assign_nodes(start, end) {
	var effect = active_effect;
	if (effect.nodes === null) effect.nodes = {
		start,
		end,
		a: null,
		t: null
	};
}
/**
* @param {string} content
* @param {number} flags
* @returns {() => Node | Node[]}
*/
/* @__NO_SIDE_EFFECTS__ */
function from_html(content, flags) {
	var is_fragment = (flags & 1) !== 0;
	var use_import_node = (flags & 2) !== 0;
	/** @type {Node} */
	var node;
	/**
	* Whether or not the first item is a text/element node. If not, we need to
	* create an additional comment node to act as `effect.nodes.start`
	*/
	var has_start = !content.startsWith("<!>");
	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}
		if (node === void 0) {
			node = create_fragment_from_html(has_start ? content : "<!>" + content);
			if (!is_fragment) node = /* @__PURE__ */ get_first_child(node);
		}
		var clone = use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true);
		if (is_fragment) {
			var start = /* @__PURE__ */ get_first_child(clone);
			var end = clone.lastChild;
			assign_nodes(start, end);
		} else assign_nodes(clone, clone);
		return clone;
	};
}
/**
* @param {string} content
* @param {number} flags
* @param {'svg' | 'math'} ns
* @returns {() => Node | Node[]}
*/
/* @__NO_SIDE_EFFECTS__ */
function from_namespace(content, flags, ns = "svg") {
	/**
	* Whether or not the first item is a text/element node. If not, we need to
	* create an additional comment node to act as `effect.nodes.start`
	*/
	var has_start = !content.startsWith("<!>");
	var is_fragment = (flags & 1) !== 0;
	var wrapped = `<${ns}>${has_start ? content : "<!>" + content}</${ns}>`;
	/** @type {Element | DocumentFragment} */
	var node;
	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}
		if (!node) {
			var root = /* @__PURE__ */ get_first_child(create_fragment_from_html(wrapped));
			if (is_fragment) {
				node = document.createDocumentFragment();
				while (/* @__PURE__ */ get_first_child(root)) node.appendChild(/* @__PURE__ */ get_first_child(root));
			} else node = /* @__PURE__ */ get_first_child(root);
		}
		var clone = node.cloneNode(true);
		if (is_fragment) {
			var start = /* @__PURE__ */ get_first_child(clone);
			var end = clone.lastChild;
			assign_nodes(start, end);
		} else assign_nodes(clone, clone);
		return clone;
	};
}
/**
* @param {string} content
* @param {number} flags
*/
/* @__NO_SIDE_EFFECTS__ */
function from_svg(content, flags) {
	return /* @__PURE__ */ from_namespace(content, flags, "svg");
}
/**
* Assign the created (or in hydration mode, traversed) dom elements to the current block
* and insert the elements into the dom (in client mode).
* @param {Text | Comment | Element} anchor
* @param {DocumentFragment | Element} dom
*/
function append(anchor, dom) {
	if (hydrating) {
		var effect = active_effect;
		if ((effect.f & 32768) === 0 || effect.nodes.end === null) effect.nodes.end = hydrate_node;
		hydrate_next();
		return;
	}
	if (anchor === null) return;
	anchor.before(dom);
}
/**
* @param {Element} text
* @param {string} value
* @returns {void}
*/
function set_text(text, value) {
	var str = value == null ? "" : typeof value === "object" ? `${value}` : value;
	if (str !== (text.__t ??= text.nodeValue)) {
		text.__t = str;
		text.nodeValue = `${str}`;
	}
}
/**
* Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
* Transitions will play during the initial render unless the `intro` option is set to `false`.
*
* @template {Record<string, any>} Props
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
* @param {MountOptions<Props>} options
* @returns {Exports}
*/
function mount(component, options) {
	return _mount(component, options);
}
/** @type {Map<EventTarget, Map<string, number>>} */
var listeners = /* @__PURE__ */ new Map();
/**
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<any>> | Component<any>} Component
* @param {MountOptions} options
* @returns {Exports}
*/
function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
	init_operations();
	/** @type {Exports} */
	var component = void 0;
	var unmount = component_root(() => {
		var anchor_node = anchor ?? target.appendChild(create_text());
		boundary(anchor_node, { pending: () => {} }, (anchor_node) => {
			push({});
			var ctx = component_context;
			if (context) ctx.c = context;
			if (events)
 /** @type {any} */ props.$$events = events;
			if (hydrating) assign_nodes(anchor_node, null);
			component = Component(anchor_node, props) || {};
			if (hydrating) {
				/** @type {Effect & { nodes: EffectNodes }} */ active_effect.nodes.end = hydrate_node;
				if (hydrate_node === null || hydrate_node.nodeType !== 8 || hydrate_node.data !== "]") {
					hydration_mismatch();
					throw HYDRATION_ERROR;
				}
			}
			pop();
		}, transformError);
		/** @type {Set<string>} */
		var registered_events = /* @__PURE__ */ new Set();
		/** @param {Array<string>} events */
		var event_handle = (events) => {
			for (var i = 0; i < events.length; i++) {
				var event_name = events[i];
				if (registered_events.has(event_name)) continue;
				registered_events.add(event_name);
				var passive = is_passive_event(event_name);
				for (const node of [target, document]) {
					var counts = listeners.get(node);
					if (counts === void 0) {
						counts = /* @__PURE__ */ new Map();
						listeners.set(node, counts);
					}
					var count = counts.get(event_name);
					if (count === void 0) {
						node.addEventListener(event_name, handle_event_propagation, { passive });
						counts.set(event_name, 1);
					} else counts.set(event_name, count + 1);
				}
			}
		};
		event_handle(array_from(all_registered_events));
		root_event_handles.add(event_handle);
		return () => {
			for (var event_name of registered_events) for (const node of [target, document]) {
				var counts = listeners.get(node);
				var count = counts.get(event_name);
				if (--count == 0) {
					node.removeEventListener(event_name, handle_event_propagation);
					counts.delete(event_name);
					if (counts.size === 0) listeners.delete(node);
				} else counts.set(event_name, count);
			}
			root_event_handles.delete(event_handle);
			if (anchor_node !== anchor) anchor_node.parentNode?.removeChild(anchor_node);
		};
	});
	mounted_components.set(component, unmount);
	return component;
}
/**
* References of the components that were mounted or hydrated.
* Uses a `WeakMap` to avoid memory leaks.
*/
var mounted_components = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
/** @import { Effect, TemplateNode } from '#client' */
/**
* @typedef {{ effect: Effect, fragment: DocumentFragment }} Branch
*/
/**
* @template Key
*/
var BranchManager = class {
	/** @type {TemplateNode} */
	anchor;
	/** @type {Map<Batch, Key>} */
	#batches = /* @__PURE__ */ new Map();
	/**
	* Map of keys to effects that are currently rendered in the DOM.
	* These effects are visible and actively part of the document tree.
	* Example:
	* ```
	* {#if condition}
	* 	foo
	* {:else}
	* 	bar
	* {/if}
	* ```
	* Can result in the entries `true->Effect` and `false->Effect`
	* @type {Map<Key, Effect>}
	*/
	#onscreen = /* @__PURE__ */ new Map();
	/**
	* Similar to #onscreen with respect to the keys, but contains branches that are not yet
	* in the DOM, because their insertion is deferred.
	* @type {Map<Key, Branch>}
	*/
	#offscreen = /* @__PURE__ */ new Map();
	/**
	* Keys of effects that are currently outroing
	* @type {Set<Key>}
	*/
	#outroing = /* @__PURE__ */ new Set();
	/**
	* Whether to pause (i.e. outro) on change, or destroy immediately.
	* This is necessary for `<svelte:element>`
	*/
	#transition = true;
	/**
	* @param {TemplateNode} anchor
	* @param {boolean} transition
	*/
	constructor(anchor, transition = true) {
		this.anchor = anchor;
		this.#transition = transition;
	}
	/**
	* @param {Batch} batch
	*/
	#commit = (batch) => {
		if (!this.#batches.has(batch)) return;
		var key = this.#batches.get(batch);
		var onscreen = this.#onscreen.get(key);
		if (onscreen) {
			resume_effect(onscreen);
			this.#outroing.delete(key);
		} else {
			var offscreen = this.#offscreen.get(key);
			if (offscreen) {
				this.#onscreen.set(key, offscreen.effect);
				this.#offscreen.delete(key);
				if (dev_fallback_default)
 /** @type {any} */ offscreen.fragment.lastChild[HMR_ANCHOR] = this.anchor;
				/** @type {TemplateNode} */ offscreen.fragment.lastChild.remove();
				this.anchor.before(offscreen.fragment);
				onscreen = offscreen.effect;
			}
		}
		for (const [b, k] of this.#batches) {
			this.#batches.delete(b);
			if (b === batch) break;
			const offscreen = this.#offscreen.get(k);
			if (offscreen) {
				destroy_effect(offscreen.effect);
				this.#offscreen.delete(k);
			}
		}
		for (const [k, effect] of this.#onscreen) {
			if (k === key || this.#outroing.has(k)) continue;
			const on_destroy = () => {
				if (Array.from(this.#batches.values()).includes(k)) {
					var fragment = document.createDocumentFragment();
					move_effect(effect, fragment);
					fragment.append(create_text());
					this.#offscreen.set(k, {
						effect,
						fragment
					});
				} else destroy_effect(effect);
				this.#outroing.delete(k);
				this.#onscreen.delete(k);
			};
			if (this.#transition || !onscreen) {
				this.#outroing.add(k);
				pause_effect(effect, on_destroy, false);
			} else on_destroy();
		}
	};
	/**
	* @param {Batch} batch
	*/
	#discard = (batch) => {
		this.#batches.delete(batch);
		const keys = Array.from(this.#batches.values());
		for (const [k, branch] of this.#offscreen) if (!keys.includes(k)) {
			destroy_effect(branch.effect);
			this.#offscreen.delete(k);
		}
	};
	/**
	*
	* @param {any} key
	* @param {null | ((target: TemplateNode) => void)} fn
	*/
	ensure(key, fn) {
		var batch = current_batch;
		var defer = should_defer_append();
		if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) if (defer) {
			var fragment = document.createDocumentFragment();
			var target = create_text();
			fragment.append(target);
			this.#offscreen.set(key, {
				effect: branch(() => fn(target)),
				fragment
			});
		} else this.#onscreen.set(key, branch(() => fn(this.anchor)));
		this.#batches.set(batch, key);
		if (defer) {
			for (const [k, effect] of this.#onscreen) if (k === key) batch.unskip_effect(effect);
			else batch.skip_effect(effect);
			for (const [k, branch] of this.#offscreen) if (k === key) batch.unskip_effect(branch.effect);
			else batch.skip_effect(branch.effect);
			batch.oncommit(this.#commit);
			batch.ondiscard(this.#discard);
		} else {
			if (hydrating) this.anchor = hydrate_node;
			this.#commit(batch);
		}
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
/** @import { TemplateNode } from '#client' */
/**
* @param {TemplateNode} node
* @param {(branch: (fn: (anchor: Node) => void, key?: number | false) => void) => void} fn
* @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
* @returns {void}
*/
function if_block(node, fn, elseif = false) {
	/** @type {TemplateNode | undefined} */
	var marker;
	if (hydrating) {
		marker = hydrate_node;
		hydrate_next();
	}
	var branches = new BranchManager(node);
	var flags = elseif ? EFFECT_TRANSPARENT : 0;
	/**
	* @param {number | false} key
	* @param {null | ((anchor: Node) => void)} fn
	*/
	function update_branch(key, fn) {
		if (hydrating) {
			var data = read_hydration_instruction(marker);
			if (key !== parseInt(data.substring(1))) {
				var anchor = skip_nodes();
				set_hydrate_node(anchor);
				branches.anchor = anchor;
				set_hydrating(false);
				branches.ensure(key, fn);
				set_hydrating(true);
				return;
			}
		}
		branches.ensure(key, fn);
	}
	block(() => {
		var has_branch = false;
		fn((fn, key = 0) => {
			has_branch = true;
			update_branch(key, fn);
		});
		if (!has_branch) update_branch(-1, null);
	}, flags);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
/** @import { EachItem, EachOutroGroup, EachState, Effect, EffectNodes, MaybeSource, Source, TemplateNode, TransitionManager, Value } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
/**
* @param {any} _
* @param {number} i
*/
function index(_, i) {
	return i;
}
/**
* Pause multiple effects simultaneously, and coordinate their
* subsequent destruction. Used in each blocks
* @param {EachState} state
* @param {Effect[]} to_destroy
* @param {null | Node} controlled_anchor
*/
function pause_effects(state, to_destroy, controlled_anchor) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	var length = to_destroy.length;
	/** @type {EachOutroGroup} */
	var group;
	var remaining = to_destroy.length;
	for (var i = 0; i < length; i++) {
		let effect = to_destroy[i];
		pause_effect(effect, () => {
			if (group) {
				group.pending.delete(effect);
				group.done.add(effect);
				if (group.pending.size === 0) {
					var groups = state.outrogroups;
					destroy_effects(state, array_from(group.done));
					groups.delete(group);
					if (groups.size === 0) state.outrogroups = null;
				}
			} else remaining -= 1;
		}, false);
	}
	if (remaining === 0) {
		var fast_path = transitions.length === 0 && controlled_anchor !== null;
		if (fast_path) {
			var anchor = controlled_anchor;
			var parent_node = anchor.parentNode;
			clear_text_content(parent_node);
			parent_node.append(anchor);
			state.items.clear();
		}
		destroy_effects(state, to_destroy, !fast_path);
	} else {
		group = {
			pending: new Set(to_destroy),
			done: /* @__PURE__ */ new Set()
		};
		(state.outrogroups ??= /* @__PURE__ */ new Set()).add(group);
	}
}
/**
* @param {EachState} state
* @param {Effect[]} to_destroy
* @param {boolean} remove_dom
*/
function destroy_effects(state, to_destroy, remove_dom = true) {
	/** @type {Set<Effect> | undefined} */
	var preserved_effects;
	if (state.pending.size > 0) {
		preserved_effects = /* @__PURE__ */ new Set();
		for (const keys of state.pending.values()) for (const key of keys) preserved_effects.add(
			/** @type {EachItem} */
			state.items.get(key).e
		);
	}
	for (var i = 0; i < to_destroy.length; i++) {
		var e = to_destroy[i];
		if (preserved_effects?.has(e)) {
			e.f |= EFFECT_OFFSCREEN;
			move_effect(e, document.createDocumentFragment());
		} else destroy_effect(to_destroy[i], remove_dom);
	}
}
/** @type {TemplateNode} */
var offscreen_anchor;
/**
* @template V
* @param {Element | Comment} node The next sibling node, or the parent node if this is a 'controlled' block
* @param {number} flags
* @param {() => V[]} get_collection
* @param {(value: V, index: number) => any} get_key
* @param {(anchor: Node, item: MaybeSource<V>, index: MaybeSource<number>) => void} render_fn
* @param {null | ((anchor: Node) => void)} fallback_fn
* @returns {void}
*/
function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
	var anchor = node;
	/** @type {Map<any, EachItem>} */
	var items = /* @__PURE__ */ new Map();
	if ((flags & 4) !== 0) {
		var parent_node = node;
		anchor = hydrating ? set_hydrate_node(/* @__PURE__ */ get_first_child(parent_node)) : parent_node.appendChild(create_text());
	}
	if (hydrating) hydrate_next();
	/** @type {Effect | null} */
	var fallback = null;
	var each_array = /* @__PURE__ */ derived_safe_equal(() => {
		var collection = get_collection();
		return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
	});
	if (dev_fallback_default) tag(each_array, "{#each ...}");
	/** @type {V[]} */
	var array;
	/** @type {Map<Batch, Set<any>>} */
	var pending = /* @__PURE__ */ new Map();
	var first_run = true;
	/**
	* @param {Batch} batch
	*/
	function commit(batch) {
		if ((state.effect.f & 16384) !== 0) return;
		state.pending.delete(batch);
		state.fallback = fallback;
		reconcile(state, array, anchor, flags, get_key);
		if (fallback !== null) if (array.length === 0) if ((fallback.f & 33554432) === 0) resume_effect(fallback);
		else {
			fallback.f ^= EFFECT_OFFSCREEN;
			move(fallback, null, anchor);
		}
		else pause_effect(fallback, () => {
			fallback = null;
		});
	}
	/**
	* @param {Batch} batch
	*/
	function discard(batch) {
		state.pending.delete(batch);
	}
	/** @type {EachState} */
	var state = {
		effect: block(() => {
			array = get(each_array);
			var length = array.length;
			/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
			let mismatch = false;
			if (hydrating) {
				if (read_hydration_instruction(anchor) === "[!" !== (length === 0)) {
					anchor = skip_nodes();
					set_hydrate_node(anchor);
					set_hydrating(false);
					mismatch = true;
				}
			}
			var keys = /* @__PURE__ */ new Set();
			var batch = current_batch;
			var defer = should_defer_append();
			for (var index = 0; index < length; index += 1) {
				if (hydrating && hydrate_node.nodeType === 8 && hydrate_node.data === "]") {
					anchor = hydrate_node;
					mismatch = true;
					set_hydrating(false);
				}
				var value = array[index];
				var key = get_key(value, index);
				if (dev_fallback_default) {
					var key_again = get_key(value, index);
					if (key !== key_again) each_key_volatile(String(index), String(key), String(key_again));
				}
				var item = first_run ? null : items.get(key);
				if (item) {
					if (item.v) internal_set(item.v, value);
					if (item.i) internal_set(item.i, index);
					if (defer) batch.unskip_effect(item.e);
				} else {
					item = create_item(items, first_run ? anchor : offscreen_anchor ??= create_text(), value, key, index, render_fn, flags, get_collection);
					if (!first_run) item.e.f |= EFFECT_OFFSCREEN;
					items.set(key, item);
				}
				keys.add(key);
			}
			if (length === 0 && fallback_fn && !fallback) if (first_run) fallback = branch(() => fallback_fn(anchor));
			else {
				fallback = branch(() => fallback_fn(offscreen_anchor ??= create_text()));
				fallback.f |= EFFECT_OFFSCREEN;
			}
			if (length > keys.size) if (dev_fallback_default) validate_each_keys(array, get_key);
			else each_key_duplicate("", "", "");
			if (hydrating && length > 0) set_hydrate_node(skip_nodes());
			if (!first_run) {
				pending.set(batch, keys);
				if (defer) {
					for (const [key, item] of items) if (!keys.has(key)) batch.skip_effect(item.e);
					batch.oncommit(commit);
					batch.ondiscard(discard);
				} else commit(batch);
			}
			if (mismatch) set_hydrating(true);
			get(each_array);
		}),
		flags,
		items,
		pending,
		outrogroups: null,
		fallback
	};
	first_run = false;
	if (hydrating) anchor = hydrate_node;
}
/**
* Skip past any non-branch effects (which could be created with `createSubscriber`, for example) to find the next branch effect
* @param {Effect | null} effect
* @returns {Effect | null}
*/
function skip_to_branch(effect) {
	while (effect !== null && (effect.f & 32) === 0) effect = effect.next;
	return effect;
}
/**
* Add, remove, or reorder items output by an each block as its input changes
* @template V
* @param {EachState} state
* @param {Array<V>} array
* @param {Element | Comment | Text} anchor
* @param {number} flags
* @param {(value: V, index: number) => any} get_key
* @returns {void}
*/
function reconcile(state, array, anchor, flags, get_key) {
	var is_animated = (flags & 8) !== 0;
	var length = array.length;
	var items = state.items;
	var current = skip_to_branch(state.effect.first);
	/** @type {undefined | Set<Effect>} */
	var seen;
	/** @type {Effect | null} */
	var prev = null;
	/** @type {undefined | Set<Effect>} */
	var to_animate;
	/** @type {Effect[]} */
	var matched = [];
	/** @type {Effect[]} */
	var stashed = [];
	/** @type {V} */
	var value;
	/** @type {any} */
	var key;
	/** @type {Effect | undefined} */
	var effect;
	/** @type {number} */
	var i;
	if (is_animated) for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		effect = items.get(key).e;
		if ((effect.f & 33554432) === 0) {
			effect.nodes?.a?.measure();
			(to_animate ??= /* @__PURE__ */ new Set()).add(effect);
		}
	}
	for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		effect = items.get(key).e;
		if (state.outrogroups !== null) for (const group of state.outrogroups) {
			group.pending.delete(effect);
			group.done.delete(effect);
		}
		if ((effect.f & 8192) !== 0) {
			resume_effect(effect);
			if (is_animated) {
				effect.nodes?.a?.unfix();
				(to_animate ??= /* @__PURE__ */ new Set()).delete(effect);
			}
		}
		if ((effect.f & 33554432) !== 0) {
			effect.f ^= EFFECT_OFFSCREEN;
			if (effect === current) move(effect, null, anchor);
			else {
				var next = prev ? prev.next : current;
				if (effect === state.effect.last) state.effect.last = effect.prev;
				if (effect.prev) effect.prev.next = effect.next;
				if (effect.next) effect.next.prev = effect.prev;
				link(state, prev, effect);
				link(state, effect, next);
				move(effect, next, anchor);
				prev = effect;
				matched = [];
				stashed = [];
				current = skip_to_branch(prev.next);
				continue;
			}
		}
		if (effect !== current) {
			if (seen !== void 0 && seen.has(effect)) {
				if (matched.length < stashed.length) {
					var start = stashed[0];
					var j;
					prev = start.prev;
					var a = matched[0];
					var b = matched[matched.length - 1];
					for (j = 0; j < matched.length; j += 1) move(matched[j], start, anchor);
					for (j = 0; j < stashed.length; j += 1) seen.delete(stashed[j]);
					link(state, a.prev, b.next);
					link(state, prev, a);
					link(state, b, start);
					current = start;
					prev = b;
					i -= 1;
					matched = [];
					stashed = [];
				} else {
					seen.delete(effect);
					move(effect, current, anchor);
					link(state, effect.prev, effect.next);
					link(state, effect, prev === null ? state.effect.first : prev.next);
					link(state, prev, effect);
					prev = effect;
				}
				continue;
			}
			matched = [];
			stashed = [];
			while (current !== null && current !== effect) {
				(seen ??= /* @__PURE__ */ new Set()).add(current);
				stashed.push(current);
				current = skip_to_branch(current.next);
			}
			if (current === null) continue;
		}
		if ((effect.f & 33554432) === 0) matched.push(effect);
		prev = effect;
		current = skip_to_branch(effect.next);
	}
	if (state.outrogroups !== null) {
		for (const group of state.outrogroups) if (group.pending.size === 0) {
			destroy_effects(state, array_from(group.done));
			state.outrogroups?.delete(group);
		}
		if (state.outrogroups.size === 0) state.outrogroups = null;
	}
	if (current !== null || seen !== void 0) {
		/** @type {Effect[]} */
		var to_destroy = [];
		if (seen !== void 0) {
			for (effect of seen) if ((effect.f & 8192) === 0) to_destroy.push(effect);
		}
		while (current !== null) {
			if ((current.f & 8192) === 0 && current !== state.fallback) to_destroy.push(current);
			current = skip_to_branch(current.next);
		}
		var destroy_length = to_destroy.length;
		if (destroy_length > 0) {
			var controlled_anchor = (flags & 4) !== 0 && length === 0 ? anchor : null;
			if (is_animated) {
				for (i = 0; i < destroy_length; i += 1) to_destroy[i].nodes?.a?.measure();
				for (i = 0; i < destroy_length; i += 1) to_destroy[i].nodes?.a?.fix();
			}
			pause_effects(state, to_destroy, controlled_anchor);
		}
	}
	if (is_animated) queue_micro_task(() => {
		if (to_animate === void 0) return;
		for (effect of to_animate) effect.nodes?.a?.apply();
	});
}
/**
* @template V
* @param {Map<any, EachItem>} items
* @param {Node} anchor
* @param {V} value
* @param {unknown} key
* @param {number} index
* @param {(anchor: Node, item: V | Source<V>, index: number | Value<number>, collection: () => V[]) => void} render_fn
* @param {number} flags
* @param {() => V[]} get_collection
* @returns {EachItem}
*/
function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
	var v = (flags & 1) !== 0 ? (flags & 16) === 0 ? /* @__PURE__ */ mutable_source(value, false, false) : source(value) : null;
	var i = (flags & 2) !== 0 ? source(index) : null;
	if (dev_fallback_default && v) v.trace = () => {
		get_collection()[i?.v ?? index];
	};
	return {
		v,
		i,
		e: branch(() => {
			render_fn(anchor, v ?? value, i ?? index, get_collection);
			return () => {
				items.delete(key);
			};
		})
	};
}
/**
* @param {Effect} effect
* @param {Effect | null} next
* @param {Text | Element | Comment} anchor
*/
function move(effect, next, anchor) {
	if (!effect.nodes) return;
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	var dest = next && (next.f & 33554432) === 0 ? next.nodes.start : anchor;
	while (node !== null) {
		var next_node = /* @__PURE__ */ get_next_sibling(node);
		dest.before(node);
		if (node === end) return;
		node = next_node;
	}
}
/**
* @param {EachState} state
* @param {Effect | null} prev
* @param {Effect | null} next
*/
function link(state, prev, next) {
	if (prev === null) state.effect.first = next;
	else prev.next = next;
	if (next === null) state.effect.last = prev;
	else next.prev = prev;
}
/**
* @param {Array<any>} array
* @param {(item: any, index: number) => string} key_fn
* @returns {void}
*/
function validate_each_keys(array, key_fn) {
	const keys = /* @__PURE__ */ new Map();
	const length = array.length;
	for (let i = 0; i < length; i++) {
		const key = key_fn(array[i], i);
		if (keys.has(key)) {
			const a = String(keys.get(key));
			const b = String(i);
			/** @type {string | null} */
			let k = String(key);
			if (k.startsWith("[object ")) k = null;
			each_key_duplicate(a, b, k);
		}
		keys.set(key, i);
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/timing.js
/** @import { Raf } from '#client' */
var now = () => performance.now();
/** @type {Raf} */
var raf = {
	tick: (_) => requestAnimationFrame(_),
	now: () => now(),
	tasks: /* @__PURE__ */ new Set()
};
//#endregion
//#region node_modules/svelte/src/internal/client/loop.js
/** @import { TaskCallback, Task, TaskEntry } from '#client' */
/**
* @returns {void}
*/
function run_tasks() {
	const now = raf.now();
	raf.tasks.forEach((task) => {
		if (!task.c(now)) {
			raf.tasks.delete(task);
			task.f();
		}
	});
	if (raf.tasks.size !== 0) raf.tick(run_tasks);
}
/**
* Creates a new task that runs on each raf frame
* until it returns a falsy value or is aborted
* @param {TaskCallback} callback
* @returns {Task}
*/
function loop(callback) {
	/** @type {TaskEntry} */
	let task;
	if (raf.tasks.size === 0) raf.tick(run_tasks);
	return {
		promise: new Promise((fulfill) => {
			raf.tasks.add(task = {
				c: callback,
				f: fulfill
			});
		}),
		abort() {
			raf.tasks.delete(task);
		}
	};
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
var whitespace = [..." 	\n\r\f\xA0\v﻿"];
/**
* @param {any} value
* @param {string | null} [hash]
* @param {Record<string, boolean>} [directives]
* @returns {string | null}
*/
function to_class(value, hash, directives) {
	var classname = value == null ? "" : "" + value;
	if (hash) classname = classname ? classname + " " + hash : hash;
	if (directives) {
		for (var key of Object.keys(directives)) if (directives[key]) classname = classname ? classname + " " + key : key;
		else if (classname.length) {
			var len = key.length;
			var a = 0;
			while ((a = classname.indexOf(key, a)) >= 0) {
				var b = a + len;
				if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
				else a = b;
			}
		}
	}
	return classname === "" ? null : classname;
}
/**
*
* @param {Record<string,any>} styles
* @param {boolean} important
*/
function append_styles(styles, important = false) {
	var separator = important ? " !important;" : ";";
	var css = "";
	for (var key of Object.keys(styles)) {
		var value = styles[key];
		if (value != null && value !== "") css += " " + key + ": " + value + separator;
	}
	return css;
}
/**
* @param {string} name
* @returns {string}
*/
function to_css_name(name) {
	if (name[0] !== "-" || name[1] !== "-") return name.toLowerCase();
	return name;
}
/**
* @param {any} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [styles]
* @returns {string | null}
*/
function to_style(value, styles) {
	if (styles) {
		var new_style = "";
		/** @type {Record<string,any> | undefined} */
		var normal_styles;
		/** @type {Record<string,any> | undefined} */
		var important_styles;
		if (Array.isArray(styles)) {
			normal_styles = styles[0];
			important_styles = styles[1];
		} else normal_styles = styles;
		if (value) {
			value = String(value).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			/** @type {boolean | '"' | "'"} */
			var in_str = false;
			var in_apo = 0;
			var in_comment = false;
			var reserved_names = [];
			if (normal_styles) reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
			if (important_styles) reserved_names.push(...Object.keys(important_styles).map(to_css_name));
			var start_index = 0;
			var name_index = -1;
			const len = value.length;
			for (var i = 0; i < len; i++) {
				var c = value[i];
				if (in_comment) {
					if (c === "/" && value[i - 1] === "*") in_comment = false;
				} else if (in_str) {
					if (in_str === c) in_str = false;
				} else if (c === "/" && value[i + 1] === "*") in_comment = true;
				else if (c === "\"" || c === "'") in_str = c;
				else if (c === "(") in_apo++;
				else if (c === ")") in_apo--;
				if (!in_comment && in_str === false && in_apo === 0) {
					if (c === ":" && name_index === -1) name_index = i;
					else if (c === ";" || i === len - 1) {
						if (name_index !== -1) {
							var name = to_css_name(value.substring(start_index, name_index).trim());
							if (!reserved_names.includes(name)) {
								if (c !== ";") i++;
								var property = value.substring(start_index, i).trim();
								new_style += " " + property + ";";
							}
						}
						start_index = i + 1;
						name_index = -1;
					}
				}
			}
		}
		if (normal_styles) new_style += append_styles(normal_styles);
		if (important_styles) new_style += append_styles(important_styles, true);
		new_style = new_style.trim();
		return new_style === "" ? null : new_style;
	}
	return value == null ? null : String(value);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
/**
* @param {Element} dom
* @param {boolean | number} is_html
* @param {string | null} value
* @param {string} [hash]
* @param {Record<string, any>} [prev_classes]
* @param {Record<string, any>} [next_classes]
* @returns {Record<string, boolean> | undefined}
*/
function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
	var prev = dom.__className;
	if (hydrating || prev !== value || prev === void 0) {
		var next_class_name = to_class(value, hash, next_classes);
		if (!hydrating || next_class_name !== dom.getAttribute("class")) if (next_class_name == null) dom.removeAttribute("class");
		else if (is_html) dom.className = next_class_name;
		else dom.setAttribute("class", next_class_name);
		dom.__className = value;
	} else if (next_classes && prev_classes !== next_classes) for (var key in next_classes) {
		var is_present = !!next_classes[key];
		if (prev_classes == null || is_present !== !!prev_classes[key]) dom.classList.toggle(key, is_present);
	}
	return next_classes;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
/**
* @param {Element & ElementCSSInlineStyle} dom
* @param {Record<string, any>} prev
* @param {Record<string, any>} next
* @param {string} [priority]
*/
function update_styles(dom, prev = {}, next, priority) {
	for (var key in next) {
		var value = next[key];
		if (prev[key] !== value) if (next[key] == null) dom.style.removeProperty(key);
		else dom.style.setProperty(key, value, priority);
	}
}
/**
* @param {Element & ElementCSSInlineStyle} dom
* @param {string | null} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [prev_styles]
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [next_styles]
*/
function set_style(dom, value, prev_styles, next_styles) {
	var prev = dom.__style;
	if (hydrating || prev !== value) {
		var next_style_attr = to_style(value, next_styles);
		if (!hydrating || next_style_attr !== dom.getAttribute("style")) if (next_style_attr == null) dom.removeAttribute("style");
		else dom.style.cssText = next_style_attr;
		dom.__style = value;
	} else if (next_styles) if (Array.isArray(next_styles)) {
		update_styles(dom, prev_styles?.[0], next_styles[0]);
		update_styles(dom, prev_styles?.[1], next_styles[1], "important");
	} else update_styles(dom, prev_styles, next_styles);
	return next_styles;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
/**
* Selects the correct option(s) (depending on whether this is a multiple select)
* @template V
* @param {HTMLSelectElement} select
* @param {V} value
* @param {boolean} mounting
*/
function select_option(select, value, mounting = false) {
	if (select.multiple) {
		if (value == void 0) return;
		if (!is_array(value)) return select_multiple_invalid_value();
		for (var option of select.options) option.selected = value.includes(get_option_value(option));
		return;
	}
	for (option of select.options) if (is(get_option_value(option), value)) {
		option.selected = true;
		return;
	}
	if (!mounting || value !== void 0) select.selectedIndex = -1;
}
/**
* Selects the correct option(s) if `value` is given,
* and then sets up a mutation observer to sync the
* current selection to the dom when it changes. Such
* changes could for example occur when options are
* inside an `#each` block.
* @param {HTMLSelectElement} select
*/
function init_select(select) {
	var observer = new MutationObserver(() => {
		select_option(select, select.__value);
	});
	observer.observe(select, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["value"]
	});
	teardown(() => {
		observer.disconnect();
	});
}
/** @param {HTMLOptionElement} option */
function get_option_value(option) {
	if ("__value" in option) return option.__value;
	else return option.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
/** @import { Blocker, Effect } from '#client' */
var IS_CUSTOM_ELEMENT = Symbol("is custom element");
var IS_HTML = Symbol("is html");
var LINK_TAG = IS_XHTML ? "link" : "LINK";
/**
* @param {Element} element
* @param {string} attribute
* @param {string | null} value
* @param {boolean} [skip_warning]
*/
function set_attribute(element, attribute, value, skip_warning) {
	var attributes = get_attributes(element);
	if (hydrating) {
		attributes[attribute] = element.getAttribute(attribute);
		if (attribute === "src" || attribute === "srcset" || attribute === "href" && element.nodeName === LINK_TAG) {
			if (!skip_warning) check_src_in_dev_hydration(element, attribute, value ?? "");
			return;
		}
	}
	if (attributes[attribute] === (attributes[attribute] = value)) return;
	if (attribute === "loading") element[LOADING_ATTR_SYMBOL] = value;
	if (value == null) element.removeAttribute(attribute);
	else if (typeof value !== "string" && get_setters(element).includes(attribute)) element[attribute] = value;
	else element.setAttribute(attribute, value);
}
/**
*
* @param {Element} element
*/
function get_attributes(element) {
	return element.__attributes ??= {
		[IS_CUSTOM_ELEMENT]: element.nodeName.includes("-"),
		[IS_HTML]: element.namespaceURI === NAMESPACE_HTML
	};
}
/** @type {Map<string, string[]>} */
var setters_cache = /* @__PURE__ */ new Map();
/** @param {Element} element */
function get_setters(element) {
	var cache_key = element.getAttribute("is") || element.nodeName;
	var setters = setters_cache.get(cache_key);
	if (setters) return setters;
	setters_cache.set(cache_key, setters = []);
	var descriptors;
	var proto = element;
	var element_proto = Element.prototype;
	while (element_proto !== proto) {
		descriptors = get_descriptors(proto);
		for (var key in descriptors) if (descriptors[key].set) setters.push(key);
		proto = get_prototype_of(proto);
	}
	return setters;
}
/**
* @param {any} element
* @param {string} attribute
* @param {string} value
*/
function check_src_in_dev_hydration(element, attribute, value) {
	if (!dev_fallback_default) return;
	if (attribute === "srcset" && srcset_url_equal(element, value)) return;
	if (src_url_equal(element.getAttribute(attribute) ?? "", value)) return;
	hydration_attribute_changed(attribute, element.outerHTML.replace(element.innerHTML, element.innerHTML && "..."), String(value));
}
/**
* @param {string} element_src
* @param {string} url
* @returns {boolean}
*/
function src_url_equal(element_src, url) {
	if (element_src === url) return true;
	return new URL(element_src, document.baseURI).href === new URL(url, document.baseURI).href;
}
/** @param {string} srcset */
function split_srcset(srcset) {
	return srcset.split(",").map((src) => src.trim().split(" ").filter(Boolean));
}
/**
* @param {HTMLSourceElement | HTMLImageElement} element
* @param {string} srcset
* @returns {boolean}
*/
function srcset_url_equal(element, srcset) {
	var element_urls = split_srcset(element.srcset);
	var urls = split_srcset(srcset);
	return urls.length === element_urls.length && urls.every(([url, width], i) => width === element_urls[i][1] && (src_url_equal(element_urls[i][0], url) || src_url_equal(url, element_urls[i][0])));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
/** @import { ComponentContext, Effect } from '#client' */
/**
* @param {any} bound_value
* @param {Element} element_or_component
* @returns {boolean}
*/
function is_bound_this(bound_value, element_or_component) {
	return bound_value === element_or_component || bound_value?.[STATE_SYMBOL] === element_or_component;
}
/**
* @param {any} element_or_component
* @param {(value: unknown, ...parts: unknown[]) => void} update
* @param {(...parts: unknown[]) => unknown} get_value
* @param {() => unknown[]} [get_parts] Set if the this binding is used inside an each block,
* 										returns all the parts of the each block context that are used in the expression
* @returns {void}
*/
function bind_this(element_or_component = {}, update, get_value, get_parts) {
	var component_effect = component_context.r;
	var parent = active_effect;
	effect(() => {
		/** @type {unknown[]} */
		var old_parts;
		/** @type {unknown[]} */
		var parts;
		render_effect(() => {
			old_parts = parts;
			parts = get_parts?.() || [];
			untrack(() => {
				if (element_or_component !== get_value(...parts)) {
					update(element_or_component, ...parts);
					if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) update(null, ...old_parts);
				}
			});
		});
		return () => {
			let p = parent;
			while (p !== component_effect && p.parent !== null && p.parent.f & 33554432) p = p.parent;
			const teardown = () => {
				if (parts && is_bound_this(get_value(...parts), element_or_component)) update(null, ...parts);
			};
			const original_teardown = p.teardown;
			p.teardown = () => {
				teardown();
				original_teardown?.();
			};
		};
	});
	return element_or_component;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
/** @import { Effect, Source } from './types.js' */
/**
* This function is responsible for synchronizing a possibly bound prop with the inner component state.
* It is used whenever the compiler sees that the component writes to the prop, or when it has a default prop_value.
* @template V
* @param {Record<string, unknown>} props
* @param {string} key
* @param {number} flags
* @param {V | (() => V)} [fallback]
* @returns {(() => V | ((arg: V) => V) | ((arg: V, mutation: boolean) => V))}
*/
function prop(props, key, flags, fallback) {
	var runes = !legacy_mode_flag || (flags & 2) !== 0;
	var bindable = (flags & 8) !== 0;
	var lazy = (flags & 16) !== 0;
	var fallback_value = fallback;
	var fallback_dirty = true;
	var get_fallback = () => {
		if (fallback_dirty) {
			fallback_dirty = false;
			fallback_value = lazy ? untrack(fallback) : fallback;
		}
		return fallback_value;
	};
	/** @type {((v: V) => void) | undefined} */
	let setter;
	if (bindable) {
		var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
		setter = get_descriptor(props, key)?.set ?? (is_entry_props && key in props ? (v) => props[key] = v : void 0);
	}
	/** @type {V} */
	var initial_value;
	var is_store_sub = false;
	if (bindable) [initial_value, is_store_sub] = capture_store_binding(() => props[key]);
	else initial_value = props[key];
	if (initial_value === void 0 && fallback !== void 0) {
		initial_value = get_fallback();
		if (setter) {
			if (runes) props_invalid_value(key);
			setter(initial_value);
		}
	}
	/** @type {() => V} */
	var getter;
	if (runes) getter = () => {
		var value = props[key];
		if (value === void 0) return get_fallback();
		fallback_dirty = true;
		return value;
	};
	else getter = () => {
		var value = props[key];
		if (value !== void 0) fallback_value = void 0;
		return value === void 0 ? fallback_value : value;
	};
	if (runes && (flags & 4) === 0) return getter;
	if (setter) {
		var legacy_parent = props.$$legacy;
		return (function(value, mutation) {
			if (arguments.length > 0) {
				if (!runes || !mutation || legacy_parent || is_store_sub)
 /** @type {Function} */ setter(mutation ? getter() : value);
				return value;
			}
			return getter();
		});
	}
	var overridden = false;
	var d = ((flags & 1) !== 0 ? derived : derived_safe_equal)(() => {
		overridden = false;
		return getter();
	});
	if (dev_fallback_default) d.label = key;
	if (bindable) get(d);
	var parent_effect = active_effect;
	return (function(value, mutation) {
		if (arguments.length > 0) {
			const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
			set(d, new_value);
			overridden = true;
			if (fallback_value !== void 0) fallback_value = new_value;
			return value;
		}
		if (is_destroying_effect && overridden || (parent_effect.f & 16384) !== 0) return d.v;
		return get(d);
	});
}
if (typeof HTMLElement === "function");
//#endregion
//#region node_modules/svelte/src/index-client.js
/** @import { ComponentContext, ComponentContextLegacy } from '#client' */
/** @import { EventDispatcher } from './index.js' */
/** @import { NotFunction } from './internal/types.js' */
if (dev_fallback_default) {
	/**
	* @param {string} rune
	*/
	function throw_rune_error(rune) {
		if (!(rune in globalThis)) {
			/** @type {any} */
			let value;
			Object.defineProperty(globalThis, rune, {
				configurable: true,
				get: () => {
					if (value !== void 0) return value;
					rune_outside_svelte(rune);
				},
				set: (v) => {
					value = v;
				}
			});
		}
	}
	throw_rune_error("$state");
	throw_rune_error("$effect");
	throw_rune_error("$derived");
	throw_rune_error("$inspect");
	throw_rune_error("$props");
	throw_rune_error("$bindable");
}
/**
* `onMount`, like [`$effect`](https://svelte.dev/docs/svelte/$effect), schedules a function to run as soon as the component has been mounted to the DOM.
* Unlike `$effect`, the provided function only runs once.
*
* It must be called during the component's initialisation (but doesn't need to live _inside_ the component;
* it can be called from an external module). If a function is returned _synchronously_ from `onMount`,
* it will be called when the component is unmounted.
*
* `onMount` functions do not run during [server-side rendering](https://svelte.dev/docs/svelte/svelte-server#render).
*
* @template T
* @param {() => NotFunction<T> | Promise<NotFunction<T>> | (() => any)} fn
* @returns {void}
*/
function onMount(fn) {
	if (component_context === null) lifecycle_outside_component("onMount");
	if (legacy_mode_flag && component_context.l !== null) init_update_callbacks(component_context).m.push(fn);
	else user_effect(() => {
		const cleanup = untrack(fn);
		if (typeof cleanup === "function") return cleanup;
	});
}
/**
* Schedules a callback to run immediately before the component is unmounted.
*
* Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
* only one that runs inside a server-side component.
*
* @param {() => any} fn
* @returns {void}
*/
function onDestroy(fn) {
	if (component_context === null) lifecycle_outside_component("onDestroy");
	onMount(() => () => untrack(fn));
}
/**
* Legacy-mode: Init callbacks object for onMount/beforeUpdate/afterUpdate
* @param {ComponentContext} context
*/
function init_update_callbacks(context) {
	var l = context.l;
	return l.u ??= {
		a: [],
		b: [],
		m: []
	};
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
if (typeof window !== "undefined") ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep, importerUrl) {
	return new URL(dep, importerUrl).href;
};
var seen = {};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		const links = document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep, importerUrl);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			const cssSelector = isCss ? "[rel=\"stylesheet\"]" : "";
			if (!!importerUrl) for (let i = links.length - 1; i >= 0; i--) {
				const link = links[i];
				if (link.href === dep && (!isCss || link.rel === "stylesheet")) return;
			}
			else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
//#endregion
//#region node_modules/@grame/faustwasm/dist/esm/index.js
var __typeError = (msg) => {
	throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var instantiateFaustModuleFromFile = async (jsFile, dataFile = jsFile.replace(/c?js$/, "data"), wasmFile = jsFile.replace(/c?js$/, "wasm")) => {
	var _a, _b;
	let FaustModule;
	let dataBinary;
	let wasmBinary;
	const jsCodeHead = /var (.+) = \(/;
	if (typeof window === "object") {
		let jsCode = await (await fetch(jsFile)).text();
		jsCode = `${jsCode}
export default ${(_a = jsCode.match(jsCodeHead)) == null ? void 0 : _a[1]};
`;
		const jsFileMod = URL.createObjectURL(new Blob([jsCode], { type: "text/javascript" }));
		FaustModule = (await __vitePreload(async () => {
			const { default: __vite_default__ } = await import(
				/* webpackIgnore: true */
				jsFileMod
);
			return { default: __vite_default__ };
		}, [], import.meta.url)).default;
		dataBinary = await (await fetch(dataFile)).arrayBuffer();
		wasmBinary = await (await fetch(wasmFile)).arrayBuffer();
	} else {
		const { promises: fs } = await __vitePreload(async () => {
			const { promises: fs } = await import("./fs-ClUJqfg6.js");
			return { promises: fs };
		}, [], import.meta.url);
		const { pathToFileURL } = await __vitePreload(async () => {
			const { pathToFileURL } = await import("./url-C2p_mfe_.js");
			return { pathToFileURL };
		}, [], import.meta.url);
		let jsCode = await fs.readFile(jsFile, { encoding: "utf-8" });
		jsCode = `
import process from "process";
import * as path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

${jsCode}

export default ${(_b = jsCode.match(jsCodeHead)) == null ? void 0 : _b[1]};
`;
		const jsFileMod = jsFile.replace(/c?js$/, "mjs");
		await fs.writeFile(jsFileMod, jsCode);
		FaustModule = (await __vitePreload(async () => {
			const { default: __vite_default__ } = await import(
				/* webpackIgnore: true */
				pathToFileURL(jsFileMod).href
);
			return { default: __vite_default__ };
		}, [], import.meta.url)).default;
		await fs.unlink(jsFileMod);
		dataBinary = new Uint8Array(await fs.readFile(dataFile)).buffer;
		wasmBinary = new Uint8Array(await fs.readFile(wasmFile)).buffer;
	}
	return await FaustModule({
		wasmBinary,
		getPreloadedPackage: (remotePackageName, remotePackageSize) => {
			if (remotePackageName === "libfaust-wasm.data") return dataBinary;
			return /* @__PURE__ */ new ArrayBuffer(0);
		}
	});
};
var instantiateFaustModuleFromFile_default = instantiateFaustModuleFromFile;
var getFaustAudioWorkletProcessor = (dependencies, faustData, register = true) => {
	const { registerProcessor, AudioWorkletProcessor, sampleRate } = globalThis;
	const { FaustBaseWebAudioDsp: FaustBaseWebAudioDsp2, FaustWasmInstantiator: FaustWasmInstantiator2, FaustAudioWorkletProcessorCommunicator: FaustAudioWorkletProcessorCommunicator2 } = dependencies;
	const { processorName, dspName, dspMeta, effectMeta, poly } = faustData;
	const analysePolyParameters = (item) => {
		const isPolyReserved = "address" in item && !![
			"/gate",
			"/freq",
			"/gain",
			"/key",
			"/vel",
			"/velocity"
		].find((k) => item.address.endsWith(k));
		if (poly && isPolyReserved) return null;
		if (item.type === "vslider" || item.type === "hslider" || item.type === "nentry") return {
			name: item.address,
			defaultValue: item.init || 0,
			minValue: item.min || 0,
			maxValue: item.max || 0
		};
		else if (item.type === "button" || item.type === "checkbox") return {
			name: item.address,
			defaultValue: item.init || 0,
			minValue: 0,
			maxValue: 1
		};
		return null;
	};
	class FaustAudioWorkletProcessor extends AudioWorkletProcessor {
		constructor(options) {
			super(options);
			this.paramValuesCache = {};
			this.fCommunicator = new FaustAudioWorkletProcessorCommunicator2(this.port);
			const { parameterDescriptors } = this.constructor;
			parameterDescriptors.forEach((pd) => {
				this.paramValuesCache[pd.name] = pd.defaultValue || 0;
			});
			const { moduleId, instanceId } = options.processorOptions;
			if (!moduleId || !instanceId) return;
			this.wamInfo = {
				moduleId,
				instanceId
			};
		}
		static get parameterDescriptors() {
			const params = [];
			const callback = (item) => {
				const param = analysePolyParameters(item);
				if (param) params.push(param);
			};
			FaustBaseWebAudioDsp2.parseUI(dspMeta.ui, callback);
			if (effectMeta) FaustBaseWebAudioDsp2.parseUI(effectMeta.ui, callback);
			return params;
		}
		setupWamEventHandler() {
			var _a;
			if (!this.wamInfo) return;
			const { moduleId, instanceId } = this.wamInfo;
			const { webAudioModules } = globalThis;
			const ModuleScope = webAudioModules.getModuleScope(moduleId);
			const paramMgrProcessor = (_a = ModuleScope == null ? void 0 : ModuleScope.paramMgrProcessors) == null ? void 0 : _a[instanceId];
			if (!paramMgrProcessor) return;
			if (paramMgrProcessor.handleEvent) return;
			paramMgrProcessor.handleEvent = (event) => {
				if (event.type === "wam-midi") this.midiMessage(event.data.bytes);
			};
		}
		process(inputs, outputs, parameters) {
			for (const path in parameters) {
				const [paramValue] = parameters[path];
				if (paramValue !== this.paramValuesCache[path]) this.setParamValue(path, paramValue);
			}
			if (this.fCommunicator.getNewAccDataAvailable()) {
				const acc = this.fCommunicator.getAcc();
				if (acc) {
					this.fCommunicator.setNewAccDataAvailable(false);
					const { invert, ...data } = acc;
					this.propagateAcc(data, invert);
				}
			}
			if (this.fCommunicator.getNewGyrDataAvailable()) {
				const gyr = this.fCommunicator.getGyr();
				if (gyr) {
					this.fCommunicator.setNewGyrDataAvailable(false);
					this.propagateGyr(gyr);
				}
			}
			return this.fDSPCode.compute(inputs[0], outputs[0]);
		}
		handleMessageAux(e) {
			const msg = e.data;
			switch (msg.type) {
				case "midi":
					this.midiMessage(msg.data);
					break;
				case "ctrlChange":
					this.ctrlChange(msg.data[0], msg.data[1], msg.data[2]);
					break;
				case "pitchWheel":
					this.pitchWheel(msg.data[0], msg.data[1]);
					break;
				case "keyOn":
					this.keyOn(msg.data[0], msg.data[1], msg.data[2]);
					break;
				case "keyOff":
					this.keyOff(msg.data[0], msg.data[1], msg.data[2]);
					break;
				case "param":
					this.setParamValue(msg.data.path, msg.data.value);
					break;
				case "setPlotHandler":
					if (msg.data) this.fDSPCode.setPlotHandler((output, index, events) => this.port.postMessage({
						type: "plot",
						value: output,
						index,
						events
					}));
					else this.fDSPCode.setPlotHandler(null);
					break;
				case "setupWamEventHandler":
					this.setupWamEventHandler();
					break;
				case "init":
					this.fDSPCode.init();
					break;
				case "instanceInit":
					this.fDSPCode.instanceInit();
					break;
				case "instanceClear":
					this.fDSPCode.instanceClear();
					break;
				case "instanceConstants":
					this.fDSPCode.instanceConstants();
					break;
				case "instanceResetUserInterface":
					this.fDSPCode.instanceResetUserInterface();
					break;
				case "start":
					this.fDSPCode.start();
					break;
				case "stop":
					this.fDSPCode.stop();
					break;
				case "destroy":
					this.port.close();
					this.fDSPCode.destroy();
					break;
				default: break;
			}
		}
		setParamValue(path, value) {
			this.fDSPCode.setParamValue(path, value);
			this.paramValuesCache[path] = value;
		}
		midiMessage(data) {
			this.fDSPCode.midiMessage(data);
		}
		ctrlChange(channel, ctrl, value) {
			this.fDSPCode.ctrlChange(channel, ctrl, value);
		}
		pitchWheel(channel, wheel) {
			this.fDSPCode.pitchWheel(channel, wheel);
		}
		keyOn(channel, pitch, velocity) {
			this.fDSPCode.keyOn(channel, pitch, velocity);
		}
		keyOff(channel, pitch, velocity) {
			this.fDSPCode.keyOff(channel, pitch, velocity);
		}
		propagateAcc(accelerationIncludingGravity, invert = false) {
			this.fDSPCode.propagateAcc(accelerationIncludingGravity, invert);
		}
		propagateGyr(event) {
			this.fDSPCode.propagateGyr(event);
		}
	}
	class FaustMonoAudioWorkletProcessor extends FaustAudioWorkletProcessor {
		constructor(options) {
			super(options);
			this.handleMessageAux = (e) => {
				super.handleMessageAux(e);
			};
			const { FaustMonoWebAudioDsp: FaustMonoWebAudioDsp2 } = dependencies;
			const { factory, sampleSize } = options.processorOptions;
			const instance = FaustWasmInstantiator2.createSyncMonoDSPInstance(factory);
			this.fDSPCode = new FaustMonoWebAudioDsp2(instance, sampleRate, sampleSize, 128, factory.soundfiles);
			this.port.addEventListener("message", this.handleMessageAux);
			this.port.start();
			this.fDSPCode.setOutputParamHandler((path, value) => this.port.postMessage({
				path,
				value,
				type: "out-param"
			}));
			this.fDSPCode.setInputParamHandler((path, value) => this.port.postMessage({
				path,
				value,
				type: "in-param"
			}));
			this.fDSPCode.start();
		}
	}
	class FaustPolyAudioWorkletProcessor extends FaustAudioWorkletProcessor {
		constructor(options) {
			super(options);
			this.handleMessageAux = (e) => {
				const msg = e.data;
				switch (msg.type) {
					case "keyOn":
						this.keyOn(msg.data[0], msg.data[1], msg.data[2]);
						break;
					case "keyOff":
						this.keyOff(msg.data[0], msg.data[1], msg.data[2]);
						break;
					default:
						super.handleMessageAux(e);
						break;
				}
			};
			const { FaustPolyWebAudioDsp: FaustPolyWebAudioDsp3 } = dependencies;
			const { voiceFactory, mixerModule, voices, effectFactory, sampleSize } = options.processorOptions;
			const instance = FaustWasmInstantiator2.createSyncPolyDSPInstance(voiceFactory, mixerModule, voices, effectFactory);
			const soundfiles = {
				...effectFactory == null ? void 0 : effectFactory.soundfiles,
				...voiceFactory.soundfiles
			};
			this.fDSPCode = new FaustPolyWebAudioDsp3(instance, sampleRate, sampleSize, 128, soundfiles);
			this.port.addEventListener("message", this.handleMessageAux);
			this.port.start();
			this.fDSPCode.setOutputParamHandler((path, value) => this.port.postMessage({
				path,
				value,
				type: "out-param"
			}));
			this.fDSPCode.setInputParamHandler((path, value) => this.port.postMessage({
				path,
				value,
				type: "in-param"
			}));
			this.fDSPCode.start();
		}
		midiMessage(data) {
			const cmd = data[0] >> 4;
			const channel = data[0] & 15;
			const data1 = data[1];
			const data2 = data[2];
			if (cmd === 8 || cmd === 9 && data2 === 0) this.keyOff(channel, data1, data2);
			else if (cmd === 9) this.keyOn(channel, data1, data2);
			else super.midiMessage(data);
		}
		keyOn(channel, pitch, velocity) {
			this.fDSPCode.keyOn(channel, pitch, velocity);
		}
		keyOff(channel, pitch, velocity) {
			this.fDSPCode.keyOff(channel, pitch, velocity);
		}
		allNotesOff(hard) {
			this.fDSPCode.allNotesOff(hard);
		}
	}
	const Processor = poly ? FaustPolyAudioWorkletProcessor : FaustMonoAudioWorkletProcessor;
	if (register) try {
		registerProcessor(processorName || dspName || (poly ? "mydsp_poly" : "mydsp"), Processor);
	} catch (error) {
		console.warn(error);
	}
	return poly ? FaustPolyAudioWorkletProcessor : FaustMonoAudioWorkletProcessor;
};
var FaustAudioWorkletProcessor_default = getFaustAudioWorkletProcessor;
var getFaustFFTAudioWorkletProcessor = (dependencies, faustData, register = true) => {
	const { registerProcessor, AudioWorkletProcessor, sampleRate } = globalThis;
	const { FaustBaseWebAudioDsp: FaustBaseWebAudioDsp2, FaustWasmInstantiator: FaustWasmInstantiator2, FaustMonoWebAudioDsp: FaustMonoWebAudioDsp2, FaustAudioWorkletProcessorCommunicator: FaustAudioWorkletProcessorCommunicator2, FFTUtils } = dependencies;
	const { processorName, dspName, dspMeta, fftOptions } = faustData;
	const { windowFunctions, getFFT, fftToSignal, signalToFFT, signalToNoFFT } = FFTUtils;
	const ceil = (x, to) => Math.abs(to) < 1 ? Math.ceil(x * (1 / to)) / (1 / to) : Math.ceil(x / to) * to;
	const mod = (x, y) => (x % y + y) % y;
	const apply = (array, windowFunction) => {
		for (let i = 0; i < array.length; i++) array[i] *= windowFunction(i, array.length);
	};
	const fftParamKeywords = [
		"/fftSize",
		"/fftHopSize",
		"/fftOverlap",
		"/windowFunction",
		"/noIFFT"
	];
	const setTypedArray = (to, from, offsetTo = 0, offsetFrom = 0) => {
		const toLength = to.length;
		const fromLength = from.length;
		const spillLength = Math.min(toLength, fromLength);
		let spilled = 0;
		let $to = mod(offsetTo, toLength) || 0;
		let $from = mod(offsetFrom, fromLength) || 0;
		while (spilled < spillLength) {
			const $spillLength = Math.min(spillLength - spilled, toLength - $to, fromLength - $from);
			const $fromEnd = $from + $spillLength;
			if ($from === 0 && $fromEnd === fromLength) to.set(from, $to);
			else to.set(from.subarray($from, $fromEnd), $to);
			$to = ($to + $spillLength) % toLength;
			$from = $fromEnd % fromLength;
			spilled += $spillLength;
		}
		return $to;
	};
	const analyseParameters = (item) => {
		if ("address" in item && !!fftParamKeywords.find((k) => item.address.endsWith(k))) return null;
		if (item.type === "vslider" || item.type === "hslider" || item.type === "nentry") return {
			name: item.address,
			defaultValue: item.init || 0,
			minValue: item.min || 0,
			maxValue: item.max || 0
		};
		else if (item.type === "button" || item.type === "checkbox") return {
			name: item.address,
			defaultValue: item.init || 0,
			minValue: 0,
			maxValue: 1
		};
		return null;
	};
	class FaustFFTAudioWorkletProcessor extends AudioWorkletProcessor {
		constructor(options) {
			super(options);
			this.paramValuesCache = {};
			this.destroyed = false;
			/** Pointer of next start sample to write of the FFT input window */
			this.$inputWrite = 0;
			/** Pointer of next start sample to read of the FFT input window */
			this.$inputRead = 0;
			/** Pointer of next start sample to write of the FFT output window */
			this.$outputWrite = 0;
			/** Pointer of next start sample to read of the FFT output window */
			this.$outputRead = 0;
			/** Not perform in IFFT when reconstruct the audio signal */
			this.noIFFT = false;
			/** audio data from input, array of channels */
			this.fftInput = [];
			/** audio data for output, array of channels */
			this.fftOutput = [];
			/** FFT Overlaps, 1 means no overlap */
			this.fftOverlap = 0;
			this.fftHopSize = 0;
			this.fftSize = 0;
			this.fftBufferSize = 0;
			this.fPlotHandler = null;
			this.fCachedEvents = [];
			this.fBufferNum = 0;
			this.soundfiles = {};
			this.windowFunction = null;
			this.handleMessageAux = (e) => {
				var _a, _b, _c;
				const msg = e.data;
				switch (msg.type) {
					case "midi":
						this.midiMessage(msg.data);
						break;
					case "ctrlChange":
						this.ctrlChange(msg.data[0], msg.data[1], msg.data[2]);
						break;
					case "pitchWheel":
						this.pitchWheel(msg.data[0], msg.data[1]);
						break;
					case "param":
						this.setParamValue(msg.data.path, msg.data.value);
						break;
					case "setPlotHandler":
						if (msg.data) this.fPlotHandler = (output, index, events) => {
							if (events) this.fCachedEvents.push(...events);
						};
						else this.fPlotHandler = null;
						(_a = this.fDSPCode) == null || _a.setPlotHandler(this.fPlotHandler);
						break;
					case "setupWamEventHandler":
						this.setupWamEventHandler();
						break;
					case "start":
						(_b = this.fDSPCode) == null || _b.start();
						break;
					case "stop":
						(_c = this.fDSPCode) == null || _c.stop();
						break;
					case "destroy":
						this.port.close();
						this.destroy();
						break;
					default: break;
				}
			};
			this.port.addEventListener("message", this.handleMessageAux);
			this.port.start();
			this.communicator = new FaustAudioWorkletProcessorCommunicator2(this.port);
			const { parameterDescriptors } = this.constructor;
			parameterDescriptors.forEach((pd) => {
				this.paramValuesCache[pd.name] = pd.defaultValue || 0;
			});
			const { factory, sampleSize } = options.processorOptions;
			this.dspInstance = FaustWasmInstantiator2.createSyncMonoDSPInstance(factory);
			this.sampleSize = sampleSize;
			this.soundfiles = factory.soundfiles;
			this.initFFT();
			const { moduleId, instanceId } = options.processorOptions;
			if (!moduleId || !instanceId) return;
			this.wamInfo = {
				moduleId,
				instanceId
			};
		}
		get fftProcessorBufferSize() {
			return this.fftSize / 2 + 1;
		}
		async initFFT() {
			this.FFT = await getFFT();
			await this.createFFTProcessor();
			return true;
		}
		static get parameterDescriptors() {
			const params = [];
			const callback = (item) => {
				const param = analyseParameters(item);
				if (param) params.push(param);
			};
			FaustBaseWebAudioDsp2.parseUI(dspMeta.ui, callback);
			return [
				...params,
				{
					defaultValue: (fftOptions == null ? void 0 : fftOptions.fftSize) || 1024,
					maxValue: 2 ** 32,
					minValue: 2,
					name: "fftSize"
				},
				{
					defaultValue: (fftOptions == null ? void 0 : fftOptions.fftOverlap) || 2,
					maxValue: 32,
					minValue: 1,
					name: "fftOverlap"
				},
				{
					defaultValue: typeof (fftOptions == null ? void 0 : fftOptions.defaultWindowFunction) === "number" ? fftOptions.defaultWindowFunction + 1 : 0,
					maxValue: (windowFunctions == null ? void 0 : windowFunctions.length) || 0,
					minValue: 0,
					name: "windowFunction"
				},
				{
					defaultValue: +!!(fftOptions == null ? void 0 : fftOptions.noIFFT) || 0,
					maxValue: 1,
					minValue: 0,
					name: "noIFFT"
				}
			];
		}
		setupWamEventHandler() {
			var _a;
			if (!this.wamInfo) return;
			const { moduleId, instanceId } = this.wamInfo;
			const { webAudioModules } = globalThis;
			const ModuleScope = webAudioModules.getModuleScope(moduleId);
			const paramMgrProcessor = (_a = ModuleScope == null ? void 0 : ModuleScope.paramMgrProcessors) == null ? void 0 : _a[instanceId];
			if (!paramMgrProcessor) return;
			if (paramMgrProcessor.handleEvent) return;
			paramMgrProcessor.handleEvent = (event) => {
				if (event.type === "wam-midi") this.midiMessage(event.data.bytes);
			};
		}
		processFFT() {
			let samplesForFFT = mod(this.$inputWrite - this.$inputRead, this.fftBufferSize) || this.fftBufferSize;
			while (samplesForFFT >= this.fftSize) {
				let fftProcessorOutputs = [];
				this.fDSPCode.compute((inputs) => {
					for (let i = 0; i < Math.min(this.fftInput.length, Math.ceil(inputs.length / 3)); i++) fftToSignal(this.rfft.forward((fftBuffer) => {
						setTypedArray(fftBuffer, this.fftInput[i], 0, this.$inputRead);
						for (let j = 0; j < fftBuffer.length; j++) fftBuffer[j] *= this.window[j];
					}), inputs[i * 3], inputs[i * 3 + 1], inputs[i * 3 + 2]);
					for (let i = this.fftInput.length * 3; i < inputs.length; i++) if (i % 3 === 2) inputs[i].forEach((v, j) => inputs[i][j] = j);
					else inputs[i].fill(0);
				}, (outputs) => {
					fftProcessorOutputs = outputs;
				});
				this.$inputRead += this.fftHopSize;
				this.$inputRead %= this.fftBufferSize;
				samplesForFFT -= this.fftHopSize;
				for (let i = 0; i < this.fftOutput.length; i++) {
					let iffted;
					if (this.noIFFT) {
						iffted = this.noIFFTBuffer;
						signalToNoFFT(fftProcessorOutputs[i * 2] || this.fftProcessorZeros, fftProcessorOutputs[i * 2 + 1] || this.fftProcessorZeros, iffted);
					} else iffted = this.rfft.inverse((ifftBuffer) => {
						signalToFFT(fftProcessorOutputs[i * 2] || this.fftProcessorZeros, fftProcessorOutputs[i * 2 + 1] || this.fftProcessorZeros, ifftBuffer);
					});
					for (let j = 0; j < iffted.length; j++) iffted[j] *= this.window[j];
					let $;
					for (let j = 0; j < iffted.length - this.fftHopSize; j++) {
						$ = mod(this.$outputWrite + j, this.fftBufferSize);
						this.fftOutput[i][$] += iffted[j];
						if (i === 0) this.windowSumSquare[$] += this.noIFFT ? this.window[j] : this.window[j] ** 2;
					}
					for (let j = iffted.length - this.fftHopSize; j < iffted.length; j++) {
						$ = mod(this.$outputWrite + j, this.fftBufferSize);
						this.fftOutput[i][$] = iffted[j];
						if (i === 0) this.windowSumSquare[$] = this.noIFFT ? this.window[j] : this.window[j] ** 2;
					}
				}
				this.$outputWrite += this.fftHopSize;
				this.$outputWrite %= this.fftBufferSize;
			}
		}
		process(inputs, outputs, parameters) {
			if (this.destroyed) return false;
			if (!this.FFT) return true;
			const input = inputs[0];
			const output = outputs[0];
			const inputChannels = (input == null ? void 0 : input.length) || 0;
			const outputChannels = (output == null ? void 0 : output.length) || 0;
			const bufferSize = (input == null ? void 0 : input.length) ? Math.max(...input.map((c) => c.length)) || 128 : 128;
			this.noIFFT = !!parameters.noIFFT[0];
			this.resetFFT(~~parameters.fftSize[0], ~~parameters.fftOverlap[0], ~~parameters.windowFunction[0], inputChannels, outputChannels, bufferSize);
			if (!this.fDSPCode) return true;
			for (const path in parameters) {
				if (fftParamKeywords.find((k) => `/${path}`.endsWith(k))) continue;
				const [paramValue] = parameters[path];
				if (paramValue !== this.paramValuesCache[path]) this.setParamValue(path, paramValue);
			}
			if (this.communicator.getNewAccDataAvailable()) {
				const acc = this.communicator.getAcc();
				if (acc) {
					this.communicator.setNewAccDataAvailable(false);
					const { invert, ...data } = acc;
					this.propagateAcc(data, invert);
				}
			}
			if (this.communicator.getNewGyrDataAvailable()) {
				const gyr = this.communicator.getGyr();
				if (gyr) {
					this.communicator.setNewGyrDataAvailable(false);
					this.propagateGyr(gyr);
				}
			}
			if (input == null ? void 0 : input.length) {
				let $inputWrite = 0;
				for (let i = 0; i < input.length; i++) {
					const inputWindow = this.fftInput[i];
					$inputWrite = setTypedArray(inputWindow, input[i].length ? input[i] : new Float32Array(bufferSize), this.$inputWrite);
				}
				this.$inputWrite = $inputWrite;
			} else {
				this.$inputWrite += bufferSize;
				this.$inputWrite %= this.fftBufferSize;
			}
			this.processFFT();
			for (let i = 0; i < output.length; i++) {
				setTypedArray(output[i], this.fftOutput[i], 0, this.$outputRead);
				let div = 0;
				for (let j = 0; j < bufferSize; j++) {
					div = this.windowSumSquare[mod(this.$outputRead + j, this.fftBufferSize)];
					output[i][j] /= div < 1e-8 ? 1 : div;
				}
			}
			this.$outputRead += bufferSize;
			this.$outputRead %= this.fftBufferSize;
			if (this.fPlotHandler) {
				this.port.postMessage({
					type: "plot",
					value: output,
					index: this.fBufferNum++,
					events: this.fCachedEvents
				});
				this.fCachedEvents = [];
			}
			return true;
		}
		setParamValue(path, value) {
			var _a;
			(_a = this.fDSPCode) == null || _a.setParamValue(path, value);
			this.paramValuesCache[path] = value;
		}
		midiMessage(data) {
			var _a;
			(_a = this.fDSPCode) == null || _a.midiMessage(data);
		}
		ctrlChange(channel, ctrl, value) {
			var _a;
			(_a = this.fDSPCode) == null || _a.ctrlChange(channel, ctrl, value);
		}
		pitchWheel(channel, wheel) {
			var _a;
			(_a = this.fDSPCode) == null || _a.pitchWheel(channel, wheel);
		}
		propagateAcc(accelerationIncludingGravity, invert = false) {
			this.fDSPCode.propagateAcc(accelerationIncludingGravity, invert);
		}
		propagateGyr(event) {
			this.fDSPCode.propagateGyr(event);
		}
		resetFFT(sizeIn, overlapIn, windowFunctionIn, inputChannels, outputChannels, bufferSize) {
			var _a, _b;
			const fftSize = ~~ceil(Math.max(2, sizeIn || 1024), 2);
			const fftOverlap = ~~Math.min(fftSize, Math.max(1, overlapIn));
			const fftHopSize = ~~Math.max(1, fftSize / fftOverlap);
			const latency = fftSize - Math.min(fftHopSize, bufferSize);
			let windowFunction = null;
			if (windowFunctionIn !== 0) windowFunction = typeof windowFunctions === "object" ? windowFunctions[~~windowFunctionIn - 1] || null : null;
			const fftSizeChanged = fftSize !== this.fftSize;
			const fftOverlapChanged = fftOverlap !== this.fftOverlap;
			if (fftSizeChanged || fftOverlapChanged) {
				this.fftSize = fftSize;
				this.fftOverlap = fftOverlap;
				this.fftHopSize = fftHopSize;
				this.$inputWrite = 0;
				this.$inputRead = 0;
				this.$outputWrite = 0;
				this.$outputRead = -latency;
				this.fftBufferSize = Math.max(fftSize * 2 - this.fftHopSize, bufferSize * 2);
				if (!fftSizeChanged && this.fftHopSizeParam) (_a = this.fDSPCode) == null || _a.setParamValue(this.fftHopSizeParam, this.fftHopSize);
			}
			if (fftSizeChanged) {
				(_b = this.rfft) == null || _b.dispose();
				this.rfft = new this.FFT(fftSize);
				this.noIFFTBuffer = new Float32Array(this.fftSize);
				this.createFFTProcessor();
			}
			if (fftSizeChanged || fftOverlapChanged || windowFunction !== this.windowFunction) {
				this.windowFunction = windowFunction;
				this.window = new Float32Array(fftSize);
				this.window.fill(1);
				if (windowFunction) apply(this.window, windowFunction);
				this.windowSumSquare = new Float32Array(this.fftBufferSize);
			}
			if (this.fftInput.length > inputChannels) this.fftInput.splice(inputChannels);
			if (this.fftOutput.length > outputChannels) this.fftOutput.splice(outputChannels);
			if (fftSizeChanged || fftOverlapChanged) {
				for (let i = 0; i < inputChannels; i++) this.fftInput[i] = new Float32Array(this.fftBufferSize);
				for (let i = 0; i < outputChannels; i++) this.fftOutput[i] = new Float32Array(this.fftBufferSize);
			} else {
				if (this.fftInput.length < inputChannels) for (let i = this.fftInput.length; i < inputChannels; i++) this.fftInput[i] = new Float32Array(this.fftBufferSize);
				if (this.fftOutput.length < outputChannels) for (let i = this.fftOutput.length; i < outputChannels; i++) this.fftOutput[i] = new Float32Array(this.fftBufferSize);
			}
		}
		async createFFTProcessor() {
			var _a, _b;
			(_a = this.fDSPCode) == null || _a.stop();
			(_b = this.fDSPCode) == null || _b.destroy();
			this.fDSPCode = new FaustMonoWebAudioDsp2(this.dspInstance, sampleRate, this.sampleSize, this.fftProcessorBufferSize, this.soundfiles);
			this.fDSPCode.setOutputParamHandler((path, value) => this.port.postMessage({
				path,
				value,
				type: "out-param"
			}));
			this.fDSPCode.setInputParamHandler((path, value) => this.port.postMessage({
				path,
				value,
				type: "in-param"
			}));
			this.fDSPCode.setPlotHandler(this.fPlotHandler);
			const params = this.fDSPCode.getParams();
			this.fDSPCode.start();
			for (const path in this.paramValuesCache) {
				if (fftParamKeywords.find((k) => `/${path}`.endsWith(k))) continue;
				this.fDSPCode.setParamValue(path, this.paramValuesCache[path]);
			}
			const fftSizeParam = params.find((s) => s.endsWith("/fftSize"));
			if (fftSizeParam) this.fDSPCode.setParamValue(fftSizeParam, this.fftSize);
			this.fftHopSizeParam = params.find((s) => s.endsWith("/fftHopSize"));
			if (this.fftHopSizeParam) this.fDSPCode.setParamValue(this.fftHopSizeParam, this.fftHopSize);
			this.fftProcessorZeros = new Float32Array(this.fftProcessorBufferSize);
		}
		destroy() {
			var _a, _b, _c;
			(_a = this.fDSPCode) == null || _a.stop();
			(_b = this.fDSPCode) == null || _b.destroy();
			(_c = this.rfft) == null || _c.dispose();
			this.destroyed = true;
		}
	}
	const Processor = FaustFFTAudioWorkletProcessor;
	if (register) try {
		registerProcessor(processorName || dspName || "myfftdsp", Processor);
	} catch (error) {
		console.warn(error);
	}
	return FaustFFTAudioWorkletProcessor;
};
var FaustFFTAudioWorkletProcessor_default = getFaustFFTAudioWorkletProcessor;
function __awaiter(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}
		function rejected(value) {
			try {
				step(generator["throw"](value));
			} catch (e) {
				reject(e);
			}
		}
		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
}
function __generator(thisArg, body) {
	var _ = {
		label: 0,
		sent: function() {
			if (t[0] & 1) throw t[1];
			return t[1];
		},
		trys: [],
		ops: []
	}, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
	return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
		return this;
	}), g;
	function verb(n) {
		return function(v) {
			return step([n, v]);
		};
	}
	function step(op) {
		if (f) throw new TypeError("Generator is already executing.");
		while (g && (g = 0, op[0] && (_ = 0)), _) try {
			if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
			if (y = 0, t) op = [op[0] & 2, t.value];
			switch (op[0]) {
				case 0:
				case 1:
					t = op;
					break;
				case 4:
					_.label++;
					return {
						value: op[1],
						done: false
					};
				case 5:
					_.label++;
					y = op[1];
					op = [0];
					continue;
				case 7:
					op = _.ops.pop();
					_.trys.pop();
					continue;
				default:
					if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
						_ = 0;
						continue;
					}
					if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
						_.label = op[1];
						break;
					}
					if (op[0] === 6 && _.label < t[1]) {
						_.label = t[1];
						t = op;
						break;
					}
					if (t && _.label < t[2]) {
						_.label = t[2];
						_.ops.push(op);
						break;
					}
					if (t[2]) _.ops.pop();
					_.trys.pop();
					continue;
			}
			op = body.call(thisArg, _);
		} catch (e) {
			op = [6, e];
			y = 0;
		} finally {
			f = t = 0;
		}
		if (op[0] & 5) throw op[1];
		return {
			value: op[0] ? op[1] : void 0,
			done: true
		};
	}
}
var BLOCK_SIZE = 64;
var DIGEST_LENGTH = 32;
var KEY = new Uint32Array([
	1116352408,
	1899447441,
	3049323471,
	3921009573,
	961987163,
	1508970993,
	2453635748,
	2870763221,
	3624381080,
	310598401,
	607225278,
	1426881987,
	1925078388,
	2162078206,
	2614888103,
	3248222580,
	3835390401,
	4022224774,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	2554220882,
	2821834349,
	2952996808,
	3210313671,
	3336571891,
	3584528711,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	2177026350,
	2456956037,
	2730485921,
	2820302411,
	3259730800,
	3345764771,
	3516065817,
	3600352804,
	4094571909,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	2227730452,
	2361852424,
	2428436474,
	2756734187,
	3204031479,
	3329325298
]);
var INIT = [
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
];
var MAX_HASHABLE_LENGTH = Math.pow(2, 53) - 1;
var RawSha256 = (function() {
	function RawSha2562() {
		this.state = Int32Array.from(INIT);
		this.temp = new Int32Array(64);
		this.buffer = new Uint8Array(64);
		this.bufferLength = 0;
		this.bytesHashed = 0;
		this.finished = false;
	}
	RawSha2562.prototype.update = function(data) {
		if (this.finished) throw new Error("Attempted to update an already finished hash.");
		var position = 0;
		var byteLength = data.byteLength;
		this.bytesHashed += byteLength;
		if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) throw new Error("Cannot hash more than 2^53 - 1 bits");
		while (byteLength > 0) {
			this.buffer[this.bufferLength++] = data[position++];
			byteLength--;
			if (this.bufferLength === BLOCK_SIZE) {
				this.hashBuffer();
				this.bufferLength = 0;
			}
		}
	};
	RawSha2562.prototype.digest = function() {
		if (!this.finished) {
			var bitsHashed = this.bytesHashed * 8;
			var bufferView = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
			var undecoratedLength = this.bufferLength;
			bufferView.setUint8(this.bufferLength++, 128);
			if (undecoratedLength % BLOCK_SIZE >= BLOCK_SIZE - 8) {
				for (var i = this.bufferLength; i < BLOCK_SIZE; i++) bufferView.setUint8(i, 0);
				this.hashBuffer();
				this.bufferLength = 0;
			}
			for (var i = this.bufferLength; i < BLOCK_SIZE - 8; i++) bufferView.setUint8(i, 0);
			bufferView.setUint32(BLOCK_SIZE - 8, Math.floor(bitsHashed / 4294967296), true);
			bufferView.setUint32(BLOCK_SIZE - 4, bitsHashed);
			this.hashBuffer();
			this.finished = true;
		}
		var out = new Uint8Array(DIGEST_LENGTH);
		for (var i = 0; i < 8; i++) {
			out[i * 4] = this.state[i] >>> 24 & 255;
			out[i * 4 + 1] = this.state[i] >>> 16 & 255;
			out[i * 4 + 2] = this.state[i] >>> 8 & 255;
			out[i * 4 + 3] = this.state[i] >>> 0 & 255;
		}
		return out;
	};
	RawSha2562.prototype.hashBuffer = function() {
		var _a = this, buffer = _a.buffer, state = _a.state;
		var state0 = state[0], state1 = state[1], state2 = state[2], state3 = state[3], state4 = state[4], state5 = state[5], state6 = state[6], state7 = state[7];
		for (var i = 0; i < BLOCK_SIZE; i++) {
			if (i < 16) this.temp[i] = (buffer[i * 4] & 255) << 24 | (buffer[i * 4 + 1] & 255) << 16 | (buffer[i * 4 + 2] & 255) << 8 | buffer[i * 4 + 3] & 255;
			else {
				var u = this.temp[i - 2];
				var t1_1 = (u >>> 17 | u << 15) ^ (u >>> 19 | u << 13) ^ u >>> 10;
				u = this.temp[i - 15];
				var t2_1 = (u >>> 7 | u << 25) ^ (u >>> 18 | u << 14) ^ u >>> 3;
				this.temp[i] = (t1_1 + this.temp[i - 7] | 0) + (t2_1 + this.temp[i - 16] | 0);
			}
			var t1 = (((state4 >>> 6 | state4 << 26) ^ (state4 >>> 11 | state4 << 21) ^ (state4 >>> 25 | state4 << 7)) + (state4 & state5 ^ ~state4 & state6) | 0) + (state7 + (KEY[i] + this.temp[i] | 0) | 0) | 0;
			var t2 = ((state0 >>> 2 | state0 << 30) ^ (state0 >>> 13 | state0 << 19) ^ (state0 >>> 22 | state0 << 10)) + (state0 & state1 ^ state0 & state2 ^ state1 & state2) | 0;
			state7 = state6;
			state6 = state5;
			state5 = state4;
			state4 = state3 + t1 | 0;
			state3 = state2;
			state2 = state1;
			state1 = state0;
			state0 = t1 + t2 | 0;
		}
		state[0] += state0;
		state[1] += state1;
		state[2] += state2;
		state[3] += state3;
		state[4] += state4;
		state[5] += state5;
		state[6] += state6;
		state[7] += state7;
	};
	return RawSha2562;
})();
var fromUtf8 = (input) => new TextEncoder().encode(input);
var fromUtf82 = typeof Buffer !== "undefined" && Buffer.from ? function(input) {
	return Buffer.from(input, "utf8");
} : fromUtf8;
function convertToBuffer(data) {
	if (data instanceof Uint8Array) return data;
	if (typeof data === "string") return fromUtf82(data);
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
	return new Uint8Array(data);
}
function isEmptyData(data) {
	if (typeof data === "string") return data.length === 0;
	return data.byteLength === 0;
}
var Sha256 = (function() {
	function Sha2562(secret) {
		this.secret = secret;
		this.hash = new RawSha256();
		this.reset();
	}
	Sha2562.prototype.update = function(toHash) {
		if (isEmptyData(toHash) || this.error) return;
		try {
			this.hash.update(convertToBuffer(toHash));
		} catch (e) {
			this.error = e;
		}
	};
	Sha2562.prototype.digestSync = function() {
		if (this.error) throw this.error;
		if (this.outer) {
			if (!this.outer.finished) this.outer.update(this.hash.digest());
			return this.outer.digest();
		}
		return this.hash.digest();
	};
	Sha2562.prototype.digest = function() {
		return __awaiter(this, void 0, void 0, function() {
			return __generator(this, function(_a) {
				return [2, this.digestSync()];
			});
		});
	};
	Sha2562.prototype.reset = function() {
		this.hash = new RawSha256();
		if (this.secret) {
			this.outer = new RawSha256();
			var inner = bufferFromSecret(this.secret);
			var outer = new Uint8Array(BLOCK_SIZE);
			outer.set(inner);
			for (var i = 0; i < BLOCK_SIZE; i++) {
				inner[i] ^= 54;
				outer[i] ^= 92;
			}
			this.hash.update(inner);
			this.outer.update(outer);
			for (var i = 0; i < inner.byteLength; i++) inner[i] = 0;
		}
	};
	return Sha2562;
})();
function bufferFromSecret(secret) {
	var input = convertToBuffer(secret);
	if (input.byteLength > BLOCK_SIZE) {
		var bufferHash = new RawSha256();
		bufferHash.update(input);
		input = bufferHash.digest();
	}
	var buffer = new Uint8Array(BLOCK_SIZE);
	buffer.set(input);
	return buffer;
}
var ab2str = (buf) => String.fromCharCode.apply(null, Array.from(buf));
var str2ab = (str) => {
	const buf = new ArrayBuffer(str.length);
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i++) bufView[i] = str.charCodeAt(i);
	return bufView;
};
var sha256 = async (str) => {
	const sha2562 = new Sha256();
	sha2562.update(str);
	return Array.from(await sha2562.digest()).map((b) => b.toString(16).padStart(2, "0")).join("");
};
var _FaustCompiler = class _FaustCompiler {
	/**
	* Get a stringified DSP factories table
	*/
	static serializeDSPFactories() {
		const table = {};
		this.gFactories.forEach((factory, shaKey) => {
			const { code, json, poly } = factory;
			table[shaKey] = {
				code: btoa(ab2str(code)),
				json: JSON.parse(json),
				poly
			};
		});
		return table;
	}
	/**
	* Get a stringified DSP factories table as string
	*/
	static stringifyDSPFactories() {
		return JSON.stringify(this.serializeDSPFactories());
	}
	/**
	* Import a DSP factories table
	*/
	static deserializeDSPFactories(table) {
		const awaited = [];
		for (const shaKey in table) {
			const { code, json, poly } = table[shaKey];
			const ab = str2ab(atob(code));
			awaited.push(WebAssembly.compile(ab).then((module) => this.gFactories.set(shaKey, {
				shaKey,
				cfactory: 0,
				code: ab,
				module,
				json: JSON.stringify(json),
				poly,
				soundfiles: {}
			})));
		}
		return Promise.all(awaited);
	}
	/**
	* Import a stringified DSP factories table
	*/
	static importDSPFactories(tableStr) {
		const table = JSON.parse(tableStr);
		return this.deserializeDSPFactories(table);
	}
	constructor(libFaust) {
		this.fLibFaust = libFaust;
		this.fErrorMessage = "";
	}
	intVec2intArray(vec) {
		const size = vec.size();
		const ui8Code = new Uint8Array(size);
		for (let i = 0; i < size; i++) ui8Code[i] = vec.get(i);
		return ui8Code;
	}
	async createDSPFactory(name, code, args, poly) {
		if (_FaustCompiler.gFactories.size > 10) _FaustCompiler.gFactories.clear();
		const shaKey = await sha256(name + code + args + (poly ? "poly" : "mono"));
		if (_FaustCompiler.gFactories.has(shaKey)) return _FaustCompiler.gFactories.get(shaKey) || null;
		else try {
			const faustDspWasm = this.fLibFaust.createDSPFactory(name, code, args, !poly);
			const ui8Code = this.intVec2intArray(faustDspWasm.data);
			faustDspWasm.data.delete();
			const module = await WebAssembly.compile(ui8Code);
			const factory = {
				shaKey,
				cfactory: faustDspWasm.cfactory,
				code: ui8Code,
				module,
				json: faustDspWasm.json,
				poly,
				soundfiles: {}
			};
			this.deleteDSPFactory(factory);
			_FaustCompiler.gFactories.set(shaKey, factory);
			return factory;
		} catch (e) {
			this.fErrorMessage = this.fLibFaust.getErrorAfterException();
			this.fLibFaust.cleanupAfterException();
			throw this.fErrorMessage ? new Error(this.fErrorMessage) : e;
		}
	}
	version() {
		return this.fLibFaust.version();
	}
	getErrorMessage() {
		return this.fErrorMessage;
	}
	async createMonoDSPFactory(name, code, args) {
		return this.createDSPFactory(name, code, args, false);
	}
	async createPolyDSPFactory(name, code, args) {
		return this.createDSPFactory(name, code, args, true);
	}
	deleteDSPFactory(factory) {
		this.fLibFaust.deleteDSPFactory(factory.cfactory);
		factory.cfactory = 0;
	}
	expandDSP(code, args) {
		try {
			return this.fLibFaust.expandDSP("FaustDSP", code, args);
		} catch (e) {
			this.fErrorMessage = this.fLibFaust.getErrorAfterException();
			this.fLibFaust.cleanupAfterException();
			throw this.fErrorMessage ? new Error(this.fErrorMessage) : e;
		}
	}
	generateAuxFiles(name, code, args) {
		try {
			return this.fLibFaust.generateAuxFiles(name, code, args);
		} catch (e) {
			this.fErrorMessage = this.fLibFaust.getErrorAfterException();
			this.fLibFaust.cleanupAfterException();
			throw this.fErrorMessage ? new Error(this.fErrorMessage) : e;
		}
	}
	deleteAllDSPFactories() {
		this.fLibFaust.deleteAllDSPFactories();
	}
	fs() {
		return this.fLibFaust.fs();
	}
	async getAsyncInternalMixerModule(isDouble = false) {
		const bufferKey = isDouble ? "mixer64Buffer" : "mixer32Buffer";
		const moduleKey = isDouble ? "mixer64Module" : "mixer32Module";
		if (this[moduleKey]) return {
			mixerBuffer: this[bufferKey],
			mixerModule: this[moduleKey]
		};
		const path = isDouble ? "/usr/rsrc/mixer64.wasm" : "/usr/rsrc/mixer32.wasm";
		const mixerBuffer = this.fs().readFile(path, { encoding: "binary" });
		this[bufferKey] = mixerBuffer;
		const mixerModule = await WebAssembly.compile(new Uint8Array(mixerBuffer));
		this[moduleKey] = mixerModule;
		return {
			mixerBuffer,
			mixerModule
		};
	}
	getSyncInternalMixerModule(isDouble = false) {
		const bufferKey = isDouble ? "mixer64Buffer" : "mixer32Buffer";
		const moduleKey = isDouble ? "mixer64Module" : "mixer32Module";
		if (this[moduleKey]) return {
			mixerBuffer: this[bufferKey],
			mixerModule: this[moduleKey]
		};
		const path = isDouble ? "/usr/rsrc/mixer64.wasm" : "/usr/rsrc/mixer32.wasm";
		const mixerBuffer = this.fs().readFile(path, { encoding: "binary" });
		this[bufferKey] = mixerBuffer;
		const mixerModule = new WebAssembly.Module(new Uint8Array(mixerBuffer));
		this[moduleKey] = mixerModule;
		return {
			mixerBuffer,
			mixerModule
		};
	}
};
_FaustCompiler.gFactories = /* @__PURE__ */ new Map();
var FaustCompiler_default = _FaustCompiler;
var FaustDspInstance = class {
	constructor(exports) {
		this.fExports = exports;
	}
	compute($dsp, count, $input, $output) {
		this.fExports.compute($dsp, count, $input, $output);
	}
	getNumInputs($dsp) {
		return this.fExports.getNumInputs($dsp);
	}
	getNumOutputs($dsp) {
		return this.fExports.getNumOutputs($dsp);
	}
	getParamValue($dsp, index) {
		return this.fExports.getParamValue($dsp, index);
	}
	getSampleRate($dsp) {
		return this.fExports.getSampleRate($dsp);
	}
	init($dsp, sampleRate) {
		this.fExports.init($dsp, sampleRate);
	}
	instanceClear($dsp) {
		this.fExports.instanceClear($dsp);
	}
	instanceConstants($dsp, sampleRate) {
		this.fExports.instanceConstants($dsp, sampleRate);
	}
	instanceInit($dsp, sampleRate) {
		this.fExports.instanceInit($dsp, sampleRate);
	}
	instanceResetUserInterface($dsp) {
		this.fExports.instanceResetUserInterface($dsp);
	}
	setParamValue($dsp, index, value) {
		this.fExports.setParamValue($dsp, index, value);
	}
};
var FaustWasmInstantiator = class {
	static createWasmImport(memory) {
		return { env: {
			memory: memory || new WebAssembly.Memory({ initial: 100 }),
			memoryBase: 0,
			tableBase: 0,
			_abs: Math.abs,
			_acosf: Math.acos,
			_asinf: Math.asin,
			_atanf: Math.atan,
			_atan2f: Math.atan2,
			_ceilf: Math.ceil,
			_cosf: Math.cos,
			_expf: Math.exp,
			_floorf: Math.floor,
			_fmodf: (x, y) => x % y,
			_logf: Math.log,
			_log10f: Math.log10,
			_max_f: Math.max,
			_min_f: Math.min,
			_remainderf: (x, y) => x - Math.round(x / y) * y,
			_powf: Math.pow,
			_roundf: Math.round,
			_sinf: Math.sin,
			_sqrtf: Math.sqrt,
			_tanf: Math.tan,
			_acoshf: Math.acosh,
			_asinhf: Math.asinh,
			_atanhf: Math.atanh,
			_coshf: Math.cosh,
			_sinhf: Math.sinh,
			_tanhf: Math.tanh,
			_isnanf: Number.isNaN,
			_isinff: (x) => !isFinite(x),
			_copysignf: (x, y) => Math.sign(x) === Math.sign(y) ? x : -x,
			_acos: Math.acos,
			_asin: Math.asin,
			_atan: Math.atan,
			_atan2: Math.atan2,
			_ceil: Math.ceil,
			_cos: Math.cos,
			_exp: Math.exp,
			_floor: Math.floor,
			_fmod: (x, y) => x % y,
			_log: Math.log,
			_log10: Math.log10,
			_max_: Math.max,
			_min_: Math.min,
			_remainder: (x, y) => x - Math.round(x / y) * y,
			_pow: Math.pow,
			_round: Math.round,
			_sin: Math.sin,
			_sqrt: Math.sqrt,
			_tan: Math.tan,
			_acosh: Math.acosh,
			_asinh: Math.asinh,
			_atanh: Math.atanh,
			_cosh: Math.cosh,
			_sinh: Math.sinh,
			_tanh: Math.tanh,
			_isnan: Number.isNaN,
			_isinf: (x) => !isFinite(x),
			_copysign: (x, y) => Math.sign(x) === Math.sign(y) ? x : -x,
			table: new WebAssembly.Table({
				initial: 0,
				element: "anyfunc"
			})
		} };
	}
	static createWasmMemoryPoly(voicesIn, sampleSize, dspMeta, effectMeta, bufferSize) {
		const voices = Math.max(4, voicesIn);
		const ptrSize = sampleSize;
		const pow2limit = (x) => {
			let n = 65536;
			while (n < x) n *= 2;
			return n;
		};
		let memorySize = pow2limit((effectMeta ? effectMeta.size : 0) + dspMeta.size * voices + (dspMeta.inputs + dspMeta.outputs * 2) * (ptrSize + bufferSize * sampleSize)) / 65536;
		memorySize = Math.max(2, memorySize);
		return new WebAssembly.Memory({ initial: memorySize });
	}
	static createWasmMemoryMono(sampleSize, dspMeta, bufferSize) {
		const ptrSize = sampleSize;
		const memorySize = (dspMeta.size + (dspMeta.inputs + dspMeta.outputs) * (ptrSize + bufferSize * sampleSize)) / 65536;
		return new WebAssembly.Memory({ initial: memorySize * 2 });
	}
	static createMonoDSPInstanceAux(instance, json, mem = null) {
		const functions = instance.exports;
		const api = new FaustDspInstance(functions);
		return {
			memory: mem ? mem : instance.exports.memory,
			api,
			json
		};
	}
	static createMemoryMono(monoFactory) {
		const monoMeta = JSON.parse(monoFactory.json);
		const sampleSize = monoMeta.compile_options.match("-double") ? 8 : 4;
		return this.createWasmMemoryMono(sampleSize, monoMeta, 8192);
	}
	static createMemoryPoly(voices, voiceFactory, effectFactory) {
		const voiceMeta = JSON.parse(voiceFactory.json);
		const effectMeta = effectFactory && effectFactory.json ? JSON.parse(effectFactory.json) : null;
		const sampleSize = voiceMeta.compile_options.match("-double") ? 8 : 4;
		return this.createWasmMemoryPoly(voices, sampleSize, voiceMeta, effectMeta, 8192);
	}
	static createMixerAux(mixerModule, memory) {
		const mixerImport = {
			imports: { print: console.log },
			memory: { memory }
		};
		return new WebAssembly.Instance(mixerModule, mixerImport).exports;
	}
	static async loadDSPFactory(wasmPath, jsonPath) {
		const wasmFile = await fetch(wasmPath);
		if (!wasmFile.ok) throw new Error(`=> exception raised while running loadDSPFactory, file not found: ${wasmPath}`);
		try {
			const wasmBuffer = await wasmFile.arrayBuffer();
			const module = await WebAssembly.compile(wasmBuffer);
			const json = await (await fetch(jsonPath)).text();
			const poly = JSON.parse(json).compile_options.indexOf("wasm-e") !== -1;
			return {
				cfactory: 0,
				code: new Uint8Array(wasmBuffer),
				module,
				json,
				poly
			};
		} catch (e) {
			throw e;
		}
	}
	static async loadDSPMixer(mixerPath, fs) {
		try {
			let mixerBuffer = null;
			if (fs) mixerBuffer = new Uint8Array(fs.readFile(mixerPath, { encoding: "binary" }));
			else mixerBuffer = await (await fetch(mixerPath)).arrayBuffer();
			return WebAssembly.compile(mixerBuffer);
		} catch (e) {
			throw e;
		}
	}
	static async createAsyncMonoDSPInstance(factory) {
		if (/"type":\s*"soundfile"/.test(factory.json)) {
			const memory = this.createMemoryMono(factory);
			const instance = await WebAssembly.instantiate(factory.module, this.createWasmImport(memory));
			return this.createMonoDSPInstanceAux(instance, factory.json, memory);
		} else {
			const instance = await WebAssembly.instantiate(factory.module, this.createWasmImport());
			return this.createMonoDSPInstanceAux(instance, factory.json);
		}
	}
	static createSyncMonoDSPInstance(factory) {
		if (/"type":\s*"soundfile"/.test(factory.json)) {
			const memory = this.createMemoryMono(factory);
			const instance = new WebAssembly.Instance(factory.module, this.createWasmImport(memory));
			return this.createMonoDSPInstanceAux(instance, factory.json, memory);
		} else {
			const instance = new WebAssembly.Instance(factory.module, this.createWasmImport());
			return this.createMonoDSPInstanceAux(instance, factory.json);
		}
	}
	static async createAsyncPolyDSPInstance(voiceFactory, mixerModule, voices, effectFactory) {
		const memory = this.createMemoryPoly(voices, voiceFactory, effectFactory);
		const voiceFunctions = (await WebAssembly.instantiate(voiceFactory.module, this.createWasmImport(memory))).exports;
		const voiceAPI = new FaustDspInstance(voiceFunctions);
		const mixerAPI = this.createMixerAux(mixerModule, memory);
		if (effectFactory) {
			const effectFunctions = (await WebAssembly.instantiate(effectFactory.module, this.createWasmImport(memory))).exports;
			return {
				memory,
				voices,
				voiceAPI,
				effectAPI: new FaustDspInstance(effectFunctions),
				mixerAPI,
				voiceJSON: voiceFactory.json,
				effectJSON: effectFactory.json
			};
		} else return {
			memory,
			voices,
			voiceAPI,
			mixerAPI,
			voiceJSON: voiceFactory.json
		};
	}
	static createSyncPolyDSPInstance(voiceFactory, mixerModule, voices, effectFactory) {
		const memory = this.createMemoryPoly(voices, voiceFactory, effectFactory);
		const voiceFunctions = new WebAssembly.Instance(voiceFactory.module, this.createWasmImport(memory)).exports;
		const voiceAPI = new FaustDspInstance(voiceFunctions);
		const mixerAPI = this.createMixerAux(mixerModule, memory);
		if (effectFactory) {
			const effectFunctions = new WebAssembly.Instance(effectFactory.module, this.createWasmImport(memory)).exports;
			return {
				memory,
				voices,
				voiceAPI,
				effectAPI: new FaustDspInstance(effectFunctions),
				mixerAPI,
				voiceJSON: voiceFactory.json,
				effectJSON: effectFactory.json
			};
		} else return {
			memory,
			voices,
			voiceAPI,
			mixerAPI,
			voiceJSON: voiceFactory.json
		};
	}
};
var FaustWasmInstantiator_default = FaustWasmInstantiator;
var FaustSensors = class _FaustSensors {
	/**
	* Function to convert a number to an axis type
	*
	* @param value number
	* @returns axis type
	*/
	static convertToAxis(value) {
		switch (value) {
			case 0: return 0;
			case 1: return 1;
			case 2: return 2;
			default:
				console.error("Error: Axis not found value: " + value);
				return 0;
		}
	}
	/**
	* Function to convert a number to a curve type
	*
	* @param value number
	* @returns curve type
	*/
	static convertToCurve(value) {
		switch (value) {
			case 0: return 0;
			case 1: return 1;
			case 2: return 2;
			case 3: return 3;
			default:
				console.error("Error: Curve not found value: " + value);
				return 0;
		}
	}
	static get Range() {
		if (!this._Range) this._Range = class {
			constructor(x, y) {
				this.fLo = Math.min(x, y);
				this.fHi = Math.max(x, y);
			}
			clip(x) {
				if (x < this.fLo) return this.fLo;
				if (x > this.fHi) return this.fHi;
				return x;
			}
		};
		return this._Range;
	}
	/**
	* Interpolator class
	*/
	static get Interpolator() {
		if (!this._Interpolator) this._Interpolator = class {
			constructor(lo, hi, v1, v2) {
				this.fRange = new _FaustSensors.Range(lo, hi);
				if (hi !== lo) {
					this.fCoef = (v2 - v1) / (hi - lo);
					this.fOffset = v1 - lo * this.fCoef;
				} else {
					this.fCoef = 0;
					this.fOffset = (v1 + v2) / 2;
				}
			}
			returnMappedValue(v) {
				const x = this.fRange.clip(v);
				return this.fOffset + x * this.fCoef;
			}
			getLowHigh(amin, amax) {
				return {
					amin: this.fRange.fLo,
					amax: this.fRange.fHi
				};
			}
		};
		return this._Interpolator;
	}
	/**
	* Interpolator3pt class, combine two interpolators
	*/
	static get Interpolator3pt() {
		if (!this._Interpolator3pt) this._Interpolator3pt = class {
			constructor(lo, mid, hi, v1, vMid, v2) {
				this.fSegment1 = new _FaustSensors.Interpolator(lo, mid, v1, vMid);
				this.fSegment2 = new _FaustSensors.Interpolator(mid, hi, vMid, v2);
				this.fMid = mid;
			}
			returnMappedValue(x) {
				return x < this.fMid ? this.fSegment1.returnMappedValue(x) : this.fSegment2.returnMappedValue(x);
			}
			getMappingValues(amin, amid, amax) {
				const lowHighSegment1 = this.fSegment1.getLowHigh(amin, amid);
				const lowHighSegment2 = this.fSegment2.getLowHigh(amid, amax);
				return {
					amin: lowHighSegment1.amin,
					amid: lowHighSegment2.amin,
					amax: lowHighSegment2.amax
				};
			}
		};
		return this._Interpolator3pt;
	}
	/**
	* UpConverter class, convert accelerometer value to Faust value
	*/
	static get UpConverter() {
		if (!this._UpConverter) this._UpConverter = class {
			constructor(amin, amid, amax, fmin, fmid, fmax) {
				this.fActive = true;
				this.fA2F = new _FaustSensors.Interpolator3pt(amin, amid, amax, fmin, fmid, fmax);
				this.fF2A = new _FaustSensors.Interpolator3pt(fmin, fmid, fmax, amin, amid, amax);
			}
			uiToFaust(x) {
				return this.fA2F.returnMappedValue(x);
			}
			faustToUi(x) {
				return this.fF2A.returnMappedValue(x);
			}
			setMappingValues(amin, amid, amax, min, init, max) {
				this.fA2F = new _FaustSensors.Interpolator3pt(amin, amid, amax, min, init, max);
				this.fF2A = new _FaustSensors.Interpolator3pt(min, init, max, amin, amid, amax);
			}
			getMappingValues(amin, amid, amax) {
				return this.fA2F.getMappingValues(amin, amid, amax);
			}
			setActive(onOff) {
				this.fActive = onOff;
			}
			getActive() {
				return this.fActive;
			}
		};
		return this._UpConverter;
	}
	/**
	* DownConverter class, convert accelerometer value to Faust value
	*/
	static get DownConverter() {
		if (!this._DownConverter) this._DownConverter = class {
			constructor(amin, amid, amax, fmin, fmid, fmax) {
				this.fActive = true;
				this.fA2F = new _FaustSensors.Interpolator3pt(amin, amid, amax, fmax, fmid, fmin);
				this.fF2A = new _FaustSensors.Interpolator3pt(fmin, fmid, fmax, amax, amid, amin);
			}
			uiToFaust(x) {
				return this.fA2F.returnMappedValue(x);
			}
			faustToUi(x) {
				return this.fF2A.returnMappedValue(x);
			}
			setMappingValues(amin, amid, amax, min, init, max) {
				this.fA2F = new _FaustSensors.Interpolator3pt(amin, amid, amax, max, init, min);
				this.fF2A = new _FaustSensors.Interpolator3pt(min, init, max, amax, amid, amin);
			}
			getMappingValues(amin, amid, amax) {
				return this.fA2F.getMappingValues(amin, amid, amax);
			}
			setActive(onOff) {
				this.fActive = onOff;
			}
			getActive() {
				return this.fActive;
			}
		};
		return this._DownConverter;
	}
	/**
	* UpDownConverter class, convert accelerometer value to Faust value
	*/
	static get UpDownConverter() {
		if (!this._UpDownConverter) this._UpDownConverter = class {
			constructor(amin, amid, amax, fmin, fmid, fmax) {
				this.fActive = true;
				this.fA2F = new _FaustSensors.Interpolator3pt(amin, amid, amax, fmin, fmax, fmin);
				this.fF2A = new _FaustSensors.Interpolator(fmin, fmax, amin, amax);
			}
			uiToFaust(x) {
				return this.fA2F.returnMappedValue(x);
			}
			faustToUi(x) {
				return this.fF2A.returnMappedValue(x);
			}
			setMappingValues(amin, amid, amax, min, init, max) {
				this.fA2F = new _FaustSensors.Interpolator3pt(amin, amid, amax, min, max, min);
				this.fF2A = new _FaustSensors.Interpolator(min, max, amin, amax);
			}
			getMappingValues(amin, amid, amax) {
				return this.fA2F.getMappingValues(amin, amid, amax);
			}
			setActive(onOff) {
				this.fActive = onOff;
			}
			getActive() {
				return this.fActive;
			}
		};
		return this._UpDownConverter;
	}
	static get DownUpConverter() {
		if (!this._DownUpConverter) this._DownUpConverter = class {
			constructor(amin, amid, amax, fmin, fmid, fmax) {
				this.fActive = true;
				this.fA2F = new _FaustSensors.Interpolator3pt(amin, amid, amax, fmax, fmin, fmax);
				this.fF2A = new _FaustSensors.Interpolator(fmin, fmax, amin, amax);
			}
			uiToFaust(x) {
				return this.fA2F.returnMappedValue(x);
			}
			faustToUi(x) {
				return this.fF2A.returnMappedValue(x);
			}
			setMappingValues(amin, amid, amax, min, init, max) {
				this.fA2F = new _FaustSensors.Interpolator3pt(amin, amid, amax, max, min, max);
				this.fF2A = new _FaustSensors.Interpolator(min, max, amin, amax);
			}
			getMappingValues(amin, amid, amax) {
				return this.fA2F.getMappingValues(amin, amid, amax);
			}
			setActive(onOff) {
				this.fActive = onOff;
			}
			getActive() {
				return this.fActive;
			}
		};
		return this._DownUpConverter;
	}
	/**
	* Public function to build the accelerometer handler
	*
	* @returns `UpdatableValueConverter` built for the given curve
	*/
	static buildHandler(curve, amin, amid, amax, min, init, max) {
		switch (curve) {
			case 0: return new _FaustSensors.UpConverter(amin, amid, amax, min, init, max);
			case 1: return new _FaustSensors.DownConverter(amin, amid, amax, min, init, max);
			case 2: return new _FaustSensors.UpDownConverter(amin, amid, amax, min, init, max);
			case 3: return new _FaustSensors.DownUpConverter(amin, amid, amax, min, init, max);
			default: return new _FaustSensors.UpConverter(amin, amid, amax, min, init, max);
		}
	}
};
var WasmAllocator = class {
	constructor(memory, offset) {
		this.memory = memory;
		this.allocatedBytes = offset;
	}
	/**
	* Allocates a block of memory of the specified size, returning the pointer to the
	* beginning of the block. The block is allocated at the current offset and the
	* offset is incremented by the size of the block.
	*
	* @param sizeInBytes The size of the block to allocate in bytes.
	* @returns The offset (pointer) to the beginning of the allocated block.
	*/
	alloc(sizeInBytes) {
		const currentOffset = this.allocatedBytes;
		const newOffset = currentOffset + sizeInBytes;
		const totalMemoryBytes = this.memory.buffer.byteLength;
		if (newOffset > totalMemoryBytes) {
			const neededPages = Math.ceil((newOffset - totalMemoryBytes) / 65536);
			console.log(`GROW: ${neededPages} pages`);
			this.memory.grow(neededPages);
		}
		this.allocatedBytes = newOffset;
		return currentOffset;
	}
	/**
	* Returns the underlying buffer object.
	*
	* @returns The buffer object.
	*/
	getBuffer() {
		return this.memory.buffer;
	}
	/**
	* Returns the Int32 view of the underlying buffer object.
	*
	* @returns The view of the memory buffer as Int32Array.
	*/
	getInt32Array() {
		return new Int32Array(this.memory.buffer);
	}
	/**
	* Returns the Int64 view of the underlying buffer object.
	*
	* @returns The view of the memory buffer as BigInt64Array.
	*/
	getInt64Array() {
		return new BigInt64Array(this.memory.buffer);
	}
	/**
	* Returns the Float32 view of the underlying buffer object.
	*
	* @returns The view of the memory buffer as Float32Array.
	*/
	getFloat32Array() {
		return new Float32Array(this.memory.buffer);
	}
	/**
	* Returns the Float64 view of the underlying buffer object..
	*
	* @returns The view of the memory buffer as Float64Array.
	*/
	getFloat64Array() {
		return new Float64Array(this.memory.buffer);
	}
};
var Soundfile = class _Soundfile {
	/** Maximum number of soundfile parts. */
	static get MAX_SOUNDFILE_PARTS() {
		return 256;
	}
	/** Maximum number of channels. */
	static get MAX_CHAN() {
		return 64;
	}
	/** Maximum buffer size in frames. */
	static get BUFFER_SIZE() {
		return 1024;
	}
	/** Default sample rate. */
	static get SAMPLE_RATE() {
		return 44100;
	}
	constructor(allocator, sampleSize, curChan, length, maxChan, totalParts) {
		this.fSampleSize = sampleSize;
		this.fIntSize = this.fSampleSize;
		this.fPtrSize = 4;
		this.fAllocator = allocator;
		console.log(`Soundfile constructor: curChan: ${curChan}, length: ${length}, maxChan: ${maxChan}, totalParts: ${totalParts}`);
		this.fPtr = allocator.alloc(4 * this.fPtrSize);
		this.fLength = allocator.alloc(_Soundfile.MAX_SOUNDFILE_PARTS * this.fIntSize);
		this.fSR = allocator.alloc(_Soundfile.MAX_SOUNDFILE_PARTS * this.fIntSize);
		this.fOffset = allocator.alloc(_Soundfile.MAX_SOUNDFILE_PARTS * this.fIntSize);
		this.fBuffers = this.allocBuffers(curChan, length, maxChan);
		const HEAP32 = this.fAllocator.getInt32Array();
		HEAP32[this.fPtr >> 2] = this.fBuffers;
		HEAP32[this.fPtr + this.fPtrSize >> 2] = this.fLength;
		HEAP32[this.fPtr + 2 * this.fPtrSize >> 2] = this.fSR;
		HEAP32[this.fPtr + 3 * this.fPtrSize >> 2] = this.fOffset;
		for (let chan = 0; chan < curChan; chan++) {
			const buffer = HEAP32[(this.fBuffers >> 2) + chan];
			console.log(`allocBuffers AFTER: ${chan} - ${buffer}`);
		}
	}
	allocBuffers(curChan, length, maxChan) {
		const buffers = this.fAllocator.alloc(maxChan * this.fPtrSize);
		console.log(`allocBuffers buffers: ${buffers}`);
		for (let chan = 0; chan < curChan; chan++) {
			const buffer = this.fAllocator.alloc(length * this.fSampleSize);
			const HEAP32 = this.fAllocator.getInt32Array();
			HEAP32[(buffers >> 2) + chan] = buffer;
		}
		return buffers;
	}
	shareBuffers(curChan, maxChan) {
		const HEAP32 = this.fAllocator.getInt32Array();
		for (let chan = curChan; chan < maxChan; chan++) HEAP32[(this.fBuffers >> 2) + chan] = HEAP32[(this.fBuffers >> 2) + chan % curChan];
	}
	copyToOut(part, maxChannels, offset, audioData) {
		if (this.fIntSize === 4) {
			const HEAP32 = this.fAllocator.getInt32Array();
			HEAP32[(this.fLength >> Math.log2(this.fIntSize)) + part] = audioData.audioBuffer[0].length;
			HEAP32[(this.fSR >> Math.log2(this.fIntSize)) + part] = audioData.sampleRate;
			HEAP32[(this.fOffset >> Math.log2(this.fIntSize)) + part] = offset;
		} else {
			const HEAP64 = this.fAllocator.getInt64Array();
			HEAP64[(this.fLength >> Math.log2(this.fIntSize)) + part] = BigInt(audioData.audioBuffer[0].length);
			HEAP64[(this.fSR >> Math.log2(this.fIntSize)) + part] = BigInt(audioData.sampleRate);
			HEAP64[(this.fOffset >> Math.log2(this.fIntSize)) + part] = BigInt(offset);
		}
		console.log(`copyToOut: part: ${part}, maxChannels: ${maxChannels}, offset: ${offset}, buffer: ${audioData}`);
		if (this.fSampleSize === 8) this.copyToOutReal64(maxChannels, offset, audioData);
		else this.copyToOutReal32(maxChannels, offset, audioData);
	}
	copyToOutReal32(maxChannels, offset, audioData) {
		const HEAP32 = this.fAllocator.getInt32Array();
		const HEAPF = this.fAllocator.getFloat32Array();
		for (let chan = 0; chan < audioData.audioBuffer.length; chan++) {
			const input = audioData.audioBuffer[chan];
			const output = HEAP32[(this.fBuffers >> 2) + chan];
			const begin = output + offset * this.fSampleSize >> Math.log2(this.fSampleSize);
			const end = output + (offset + input.length) * this.fSampleSize >> Math.log2(this.fSampleSize);
			console.log(`copyToOutReal32 begin: ${begin}, end: ${end}, delta: ${end - begin}`);
			const outputReal = HEAPF.subarray(output + offset * this.fSampleSize >> Math.log2(this.fSampleSize), output + (offset + input.length) * this.fSampleSize >> Math.log2(this.fSampleSize));
			for (let sample = 0; sample < input.length; sample++) outputReal[sample] = input[sample];
		}
	}
	copyToOutReal64(maxChannels, offset, audioData) {
		const HEAP32 = this.fAllocator.getInt32Array();
		const HEAPF = this.fAllocator.getFloat64Array();
		for (let chan = 0; chan < audioData.audioBuffer.length; chan++) {
			const input = audioData.audioBuffer[chan];
			const output = HEAP32[(this.fBuffers >> 2) + chan];
			const begin = output + offset * this.fSampleSize >> Math.log2(this.fSampleSize);
			const end = output + (offset + input.length) * this.fSampleSize >> Math.log2(this.fSampleSize);
			console.log(`copyToOutReal64 begin: ${begin}, end: ${end}, delta: ${end - begin}`);
			const outputReal = HEAPF.subarray(output + offset * this.fSampleSize >> Math.log2(this.fSampleSize), output + (offset + input.length) * this.fSampleSize >> Math.log2(this.fSampleSize));
			for (let sample = 0; sample < input.length; sample++) outputReal[sample] = input[sample];
		}
	}
	emptyFile(part, offset) {
		if (this.fIntSize === 4) {
			const HEAP32 = this.fAllocator.getInt32Array();
			HEAP32[(this.fLength >> Math.log2(this.fIntSize)) + part] = _Soundfile.BUFFER_SIZE;
			HEAP32[(this.fSR >> Math.log2(this.fIntSize)) + part] = _Soundfile.SAMPLE_RATE;
			HEAP32[(this.fOffset >> Math.log2(this.fIntSize)) + part] = offset;
		} else {
			const HEAP64 = this.fAllocator.getInt64Array();
			HEAP64[(this.fLength >> Math.log2(this.fIntSize)) + part] = BigInt(_Soundfile.BUFFER_SIZE);
			HEAP64[(this.fSR >> Math.log2(this.fIntSize)) + part] = BigInt(_Soundfile.SAMPLE_RATE);
			HEAP64[(this.fOffset >> Math.log2(this.fIntSize)) + part] = BigInt(offset);
		}
		return offset + _Soundfile.BUFFER_SIZE;
	}
	displayMemory(where = "", mem = false) {
		console.log("Soundfile memory: " + where);
		console.log(`fPtr: ${this.fPtr}`);
		console.log(`fBuffers: ${this.fBuffers}`);
		console.log(`fLength: ${this.fLength}`);
		console.log(`fSR: ${this.fSR}`);
		console.log(`fOffset: ${this.fOffset}`);
		const HEAP32 = this.fAllocator.getInt32Array();
		if (mem) console.log(`HEAP32: ${HEAP32}`);
		console.log(`HEAP32[this.fPtr >> 2]: ${HEAP32[this.fPtr >> 2]}`);
		console.log(`HEAP32[(this.fPtr + ptrSize) >> 2]: ${HEAP32[this.fPtr + this.fPtrSize >> 2]}`);
		console.log(`HEAP32[(this.fPtr + 2 * ptrSize) >> 2]: ${HEAP32[this.fPtr + 2 * this.fPtrSize >> 2]}`);
		console.log(`HEAP32[(this.fPtr + 3 * ptrSize) >> 2]: ${HEAP32[this.fPtr + 3 * this.fPtrSize >> 2]}`);
	}
	getPtr() {
		return this.fPtr;
	}
	getHEAP32() {
		return this.fAllocator.getInt32Array();
	}
	getHEAPFloat32() {
		return this.fAllocator.getFloat32Array();
	}
	getHEAPFloat64() {
		return this.fAllocator.getFloat64Array();
	}
};
var FaustBaseWebAudioDsp = class _FaustBaseWebAudioDsp {
	constructor(sampleSize, bufferSize, soundfiles) {
		this.fOutputHandler = null;
		this.fInputHandler = null;
		this.fComputeHandler = null;
		this.fPlotHandler = null;
		this.fCachedEvents = [];
		this.fBufferNum = 0;
		this.fInChannels = [];
		this.fOutChannels = [];
		this.fOutputsTimer = 5;
		this.fInputsItems = [];
		this.fOutputsItems = [];
		this.fDescriptor = [];
		this.fSoundfiles = [];
		this.fSoundfileBuffers = {};
		this.fPitchwheelLabel = [];
		this.fCtrlLabel = new Array(128).fill(null).map(() => []);
		this.fMidiKeyLabel = new Array(128).fill(null).map(() => []);
		this.fMidiKeyOnLabel = new Array(128).fill(null).map(() => []);
		this.fMidiKeyOffLabel = new Array(128).fill(null).map(() => []);
		this.fPathTable = {};
		this.fUICallback = (item) => {
			if (item.type === "hbargraph" || item.type === "vbargraph") {
				const registerPath = (alias) => {
					if (this.fPathTable[alias] === void 0) this.fPathTable[alias] = item.index;
				};
				this.fOutputsItems.push(item.address);
				registerPath(item.address);
				registerPath(item.shortname);
				registerPath(item.label);
			} else if (item.type === "vslider" || item.type === "hslider" || item.type === "button" || item.type === "checkbox" || item.type === "nentry") {
				const registerPath = (alias) => {
					if (this.fPathTable[alias] === void 0) this.fPathTable[alias] = item.index;
				};
				this.fInputsItems.push(item.address);
				registerPath(item.address);
				registerPath(item.shortname);
				registerPath(item.label);
				this.fDescriptor.push(item);
				if (!item.meta) return;
				item.meta.forEach((meta) => {
					var _a, _b, _c, _d, _e, _f;
					const { midi, acc, gyr } = meta;
					if (midi) {
						const strMidi = midi.trim();
						if (strMidi === "pitchwheel") {
							const matched = strMidi.match(/^pitchwheel\s(\d+)/);
							if (matched) this.fPitchwheelLabel.push({
								path: item.address,
								chan: parseInt(matched[1]),
								min: item.min,
								max: item.max
							});
							else this.fPitchwheelLabel.push({
								path: item.address,
								chan: 0,
								min: item.min,
								max: item.max
							});
						} else {
							const matched2 = strMidi.match(/^ctrl\s(\d+)\s(\d+)/);
							const matched1 = strMidi.match(/^ctrl\s(\d+)/);
							const matchedKey = strMidi.match(/^key\s+(\d+)(?:\s+(\d+))?$/);
							const matchedKeyOn = strMidi.match(/^keyon\s+(\d+)(?:\s+(\d+))?$/);
							const matchedKeyOff = strMidi.match(/^keyoff\s+(\d+)(?:\s+(\d+))?$/);
							if (matched2) this.fCtrlLabel[parseInt(matched2[1])].push({
								path: item.address,
								chan: parseInt(matched2[2]),
								min: item.min,
								max: item.max
							});
							else if (matched1) this.fCtrlLabel[parseInt(matched1[1])].push({
								path: item.address,
								chan: 0,
								min: item.min,
								max: item.max
							});
							else if (matchedKey) {
								const note = parseInt(matchedKey[1]);
								const channel = matchedKey[2] ? parseInt(matchedKey[2]) : 0;
								this.fMidiKeyLabel[note].push({
									path: item.address,
									chan: channel,
									min: (_a = item.min) != null ? _a : 0,
									max: (_b = item.max) != null ? _b : 1
								});
							} else if (matchedKeyOn) {
								const note = parseInt(matchedKeyOn[1]);
								const channel = matchedKeyOn[2] ? parseInt(matchedKeyOn[2]) : 0;
								this.fMidiKeyOnLabel[note].push({
									path: item.address,
									chan: channel,
									min: (_c = item.min) != null ? _c : 0,
									max: (_d = item.max) != null ? _d : 1
								});
							} else if (matchedKeyOff) {
								const note = parseInt(matchedKeyOff[1]);
								const channel = matchedKeyOff[2] ? parseInt(matchedKeyOff[2]) : 0;
								this.fMidiKeyOffLabel[note].push({
									path: item.address,
									chan: channel,
									min: (_e = item.min) != null ? _e : 0,
									max: (_f = item.max) != null ? _f : 1
								});
							}
						}
					}
					if (acc) {
						const numAcc = acc.trim().split(" ").map(Number);
						this.setupAccHandler(item.address, FaustSensors.convertToAxis(numAcc[0]), FaustSensors.convertToCurve(numAcc[1]), numAcc[2], numAcc[3], numAcc[4], item.min, item.init, item.max);
					}
					if (gyr) {
						const numAcc = gyr.trim().split(" ").map(Number);
						this.setupGyrHandler(item.address, FaustSensors.convertToAxis(numAcc[0]), FaustSensors.convertToCurve(numAcc[1]), numAcc[2], numAcc[3], numAcc[4], item.min, item.init, item.max);
					}
				});
			} else if (item.type === "soundfile") this.fSoundfiles.push({
				name: item.label,
				url: item.url,
				index: item.index,
				basePtr: -1
			});
		};
		this.fProcessing = false;
		this.fDestroyed = false;
		this.fFirstCall = true;
		this.fBufferSize = bufferSize;
		this.fPtrSize = sampleSize;
		this.fSampleSize = sampleSize;
		this.fSoundfileBuffers = soundfiles;
		this.fAcc = {
			x: [],
			y: [],
			z: []
		};
		this.fGyr = {
			x: [],
			y: [],
			z: []
		};
	}
	static remap(v, mn0, mx0, mn1, mx1) {
		return (v - mn0) / (mx0 - mn0) * (mx1 - mn1) + mn1;
	}
	static parseUI(ui, callback) {
		ui.forEach((group) => this.parseGroup(group, callback));
	}
	static parseGroup(group, callback) {
		if (group.items) this.parseItems(group.items, callback);
	}
	static parseItems(items, callback) {
		items.forEach((item) => this.parseItem(item, callback));
	}
	static parseItem(item, callback) {
		if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup") this.parseItems(item.items, callback);
		else callback(item);
	}
	/** Split the soundfile names and return an array of names */
	static splitSoundfileNames(input) {
		return input.replace(/^\{|\}$/g, "").split(";").map((str) => str.length <= 2 ? "" : str.substring(1, str.length - 1)).map((str) => str.trim()).filter((str) => str.length > 0);
	}
	get hasAccInput() {
		return this.fAcc.x.length + this.fAcc.y.length + this.fAcc.z.length > 0;
	}
	propagateAcc(accelerationIncludingGravity, invert = false) {
		const { x, y, z } = accelerationIncludingGravity;
		if (invert) {
			if (x !== null) this.fAcc.x.forEach((handler) => handler(-x));
			if (y !== null) this.fAcc.y.forEach((handler) => handler(-y));
			if (z !== null) this.fAcc.z.forEach((handler) => handler(-z));
		} else {
			if (x !== null) this.fAcc.x.forEach((handler) => handler(x));
			if (y !== null) this.fAcc.y.forEach((handler) => handler(y));
			if (z !== null) this.fAcc.z.forEach((handler) => handler(z));
		}
	}
	get hasGyrInput() {
		return this.fGyr.x.length + this.fGyr.y.length + this.fGyr.z.length > 0;
	}
	propagateGyr(event) {
		const { alpha, beta, gamma } = event;
		if (alpha !== null) this.fGyr.x.forEach((handler) => handler(alpha));
		if (beta !== null) this.fGyr.y.forEach((handler) => handler(beta));
		if (gamma !== null) this.fGyr.z.forEach((handler) => handler(gamma));
	}
	/** Build the accelerometer handler */
	setupAccHandler(path, axis, curve, amin, amid, amax, min, init, max) {
		const handler = FaustSensors.buildHandler(curve, amin, amid, amax, min, init, max);
		switch (axis) {
			case 0:
				this.fAcc.x.push((val) => this.setParamValue(path, handler.uiToFaust(val)));
				break;
			case 1:
				this.fAcc.y.push((val) => this.setParamValue(path, handler.uiToFaust(val)));
				break;
			case 2:
				this.fAcc.z.push((val) => this.setParamValue(path, handler.uiToFaust(val)));
				break;
		}
	}
	/** Build the gyroscope handler */
	setupGyrHandler(path, axis, curve, amin, amid, amax, min, init, max) {
		const handler = FaustSensors.buildHandler(curve, amin, amid, amax, min, init, max);
		switch (axis) {
			case 0:
				this.fGyr.x.push((val) => this.setParamValue(path, handler.uiToFaust(val)));
				break;
			case 1:
				this.fGyr.y.push((val) => this.setParamValue(path, handler.uiToFaust(val)));
				break;
			case 2:
				this.fGyr.z.push((val) => this.setParamValue(path, handler.uiToFaust(val)));
				break;
		}
	}
	static extractUrlsFromMeta(dspMeta) {
		const soundfilesEntry = dspMeta.meta.find((entry) => entry.soundfiles !== void 0);
		if (soundfilesEntry) return soundfilesEntry.soundfiles.split(";").filter((url) => url !== "");
		else return [];
	}
	/**
	* Load a soundfile possibly containing several parts in the DSP struct.
	* Soundfile pointers are located at 'index' offset, to be read in the JSON file.
	* The DSP struct is located at baseDSP in the wasm memory,
	* either a monophonic DSP, or a voice in a polyphonic context.
	*
	* @param allocator : the wasm memory allocator
	* @param baseDSP : the base DSP in the wasm memory
	* @param name : the name of the soundfile
	* @param url : the url of the soundfile
	*/
	loadSoundfile(allocator, baseDSP, name, url) {
		console.log(`Soundfile ${name} paths: ${url}`);
		const soundfileIds = _FaustBaseWebAudioDsp.splitSoundfileNames(url);
		const item = this.fSoundfiles.find((item2) => item2.url === url);
		if (!item) throw new Error(`Soundfile with ${url} cannot be found !}`);
		if (item.basePtr !== -1) {
			const HEAP32 = allocator.getInt32Array();
			console.log(`Soundfile CACHE ${url}} : ${name} loaded at ${item.basePtr} in wasm memory with index ${item.index}`);
			HEAP32[baseDSP + item.index >> 2] = item.basePtr;
		} else {
			const soundfile = this.createSoundfile(allocator, soundfileIds, this.fSoundfileBuffers);
			if (soundfile) {
				const HEAP32 = soundfile.getHEAP32();
				item.basePtr = soundfile.getPtr();
				console.log(`Soundfile ${name} loaded at ${item.basePtr} in wasm memory with index ${item.index}`);
				HEAP32[baseDSP + item.index >> 2] = item.basePtr;
			} else console.log(`Soundfile ${name} for ${url} cannot be created !}`);
		}
	}
	createSoundfile(allocator, soundfileIdList, soundfiles, maxChan = Soundfile.MAX_CHAN) {
		let curChan = 1;
		let totalLength = 0;
		for (const soundfileId of soundfileIdList) {
			let chan = 0;
			let len = 0;
			const audioData = soundfiles == null ? void 0 : soundfiles[soundfileId];
			if (audioData) {
				chan = audioData.audioBuffer.length;
				len = audioData.audioBuffer[0].length;
			} else {
				len = Soundfile.BUFFER_SIZE;
				chan = 1;
			}
			curChan = Math.max(curChan, chan);
			totalLength += len;
		}
		totalLength += (Soundfile.MAX_SOUNDFILE_PARTS - soundfileIdList.length) * Soundfile.BUFFER_SIZE;
		const soundfile = new Soundfile(allocator, this.fSampleSize, curChan, totalLength, maxChan, soundfileIdList.length);
		let offset = 0;
		for (let part = 0; part < soundfileIdList.length; part++) {
			const soundfileId = soundfileIdList[part];
			const audioData = soundfiles == null ? void 0 : soundfiles[soundfileId];
			if (audioData) {
				soundfile.copyToOut(part, maxChan, offset, audioData);
				offset += audioData.audioBuffer[0].length;
			} else offset = soundfile.emptyFile(part, offset);
		}
		for (let part = soundfileIdList.length; part < Soundfile.MAX_SOUNDFILE_PARTS; part++) offset = soundfile.emptyFile(part, offset);
		soundfile.shareBuffers(curChan, maxChan);
		return soundfile;
	}
	/**
	* Init soundfiles memory.
	*
	* @param allocator : the wasm memory allocator
	* @param baseDSP : the DSP struct (either a monophonic DSP of polyphonic voice) base DSP in the wasm memory
	*/
	initSoundfileMemory(allocator, baseDSP) {
		for (const { name, url } of this.fSoundfiles) this.loadSoundfile(allocator, baseDSP, name, url);
	}
	updateOutputs() {
		if (this.fOutputsItems.length > 0 && this.fOutputHandler && this.fOutputsTimer-- === 0) {
			this.fOutputsTimer = 5;
			this.fOutputsItems.forEach((item) => {
				var _a;
				return (_a = this.fOutputHandler) == null ? void 0 : _a.call(this, item, this.getParamValue(item));
			});
		}
	}
	metadata(handler) {
		if (this.fJSONDsp.meta) this.fJSONDsp.meta.forEach((meta) => handler(Object.keys(meta)[0], meta[Object.keys(meta)[0]]));
	}
	compute(input, output) {
		return false;
	}
	setOutputParamHandler(handler) {
		this.fOutputHandler = handler;
	}
	getOutputParamHandler() {
		return this.fOutputHandler;
	}
	callOutputParamHandler(path, value) {
		if (this.fOutputHandler) this.fOutputHandler(path, value);
	}
	setInputParamHandler(handler) {
		this.fInputHandler = handler;
	}
	getInputParamHandler() {
		return this.fInputHandler;
	}
	callInputParamHandler(path, value) {
		if (this.fInputHandler) this.fInputHandler(path, value);
	}
	setComputeHandler(handler) {
		this.fComputeHandler = handler;
	}
	getComputeHandler() {
		return this.fComputeHandler;
	}
	setPlotHandler(handler) {
		this.fPlotHandler = handler;
	}
	getPlotHandler() {
		return this.fPlotHandler;
	}
	getNumInputs() {
		return -1;
	}
	getNumOutputs() {
		return -1;
	}
	midiMessage(data) {
		if (this.fPlotHandler) this.fCachedEvents.push({
			data,
			type: "midi"
		});
		const cmd = data[0] >> 4;
		const channel = data[0] & 15;
		const data1 = data[1];
		const data2 = data[2];
		if (cmd === 11) return this.ctrlChange(channel, data1, data2);
		if (cmd === 14) return this.pitchWheel(channel, data2 * 128 + data1);
		if (cmd === 9) if (data2 > 0) return this.keyOn(channel, data1, data2);
		else return this.keyOff(channel, data1, data2);
		if (cmd === 8) return this.keyOff(channel, data1, data2);
	}
	ctrlChange(channel, ctrl, value) {
		if (this.fPlotHandler) this.fCachedEvents.push({
			type: "ctrlChange",
			data: [
				channel,
				ctrl,
				value
			]
		});
		if (this.fCtrlLabel[ctrl].length) this.fCtrlLabel[ctrl].forEach((ctrl2) => {
			const { path, chan } = ctrl2;
			if (chan === 0 || channel === chan - 1) {
				this.setParamValue(path, _FaustBaseWebAudioDsp.remap(value, 0, 127, ctrl2.min, ctrl2.max));
				if (this.fOutputHandler) this.fOutputHandler(path, this.getParamValue(path));
			}
		});
	}
	keyOn(channel, pitch, velocity) {
		if (this.fPlotHandler) this.fCachedEvents.push({
			type: "keyOn",
			data: [
				channel,
				pitch,
				velocity
			]
		});
		this.fMidiKeyOnLabel[pitch].forEach((key) => {
			const { path, chan } = key;
			if (chan === 0 || channel === chan - 1) {
				this.setParamValue(path, _FaustBaseWebAudioDsp.remap(velocity, 0, 127, key.min, key.max));
				if (this.fOutputHandler) this.fOutputHandler(path, this.getParamValue(path));
			}
		});
		this.fMidiKeyLabel[pitch].forEach((key) => {
			const { path, chan } = key;
			if (chan === 0 || channel === chan - 1) {
				this.setParamValue(path, _FaustBaseWebAudioDsp.remap(velocity, 0, 127, key.min, key.max));
				if (this.fOutputHandler) this.fOutputHandler(path, this.getParamValue(path));
			}
		});
	}
	keyOff(channel, pitch, velocity) {
		if (this.fPlotHandler) this.fCachedEvents.push({
			type: "keyOff",
			data: [
				channel,
				pitch,
				velocity
			]
		});
		this.fMidiKeyOffLabel[pitch].forEach((key) => {
			const { path, chan } = key;
			if (chan === 0 || channel === chan - 1) {
				this.setParamValue(path, _FaustBaseWebAudioDsp.remap(velocity, 0, 127, key.min, key.max));
				if (this.fOutputHandler) this.fOutputHandler(path, this.getParamValue(path));
			}
		});
		this.fMidiKeyLabel[pitch].forEach((key) => {
			const { path, chan } = key;
			if (chan === 0 || channel === chan - 1) {
				this.setParamValue(path, 0);
				if (this.fOutputHandler) this.fOutputHandler(path, this.getParamValue(path));
			}
		});
	}
	pitchWheel(channel, wheel) {
		if (this.fPlotHandler) this.fCachedEvents.push({
			type: "pitchWheel",
			data: [channel, wheel]
		});
		this.fPitchwheelLabel.forEach((pw) => {
			const { path, chan } = pw;
			if (chan === 0 || channel === chan - 1) {
				this.setParamValue(path, _FaustBaseWebAudioDsp.remap(wheel, 0, 16383, pw.min, pw.max));
				if (this.fOutputHandler) this.fOutputHandler(path, this.getParamValue(path));
			}
		});
	}
	setParamValue(path, value) {}
	getParamValue(path) {
		return 0;
	}
	getParams() {
		return this.fInputsItems;
	}
	getMeta() {
		return this.fJSONDsp;
	}
	getJSON() {
		return JSON.stringify(this.getMeta());
	}
	getUI() {
		return this.fJSONDsp.ui;
	}
	getDescriptors() {
		return this.fDescriptor;
	}
	hasSoundfiles() {
		return this.fSoundfiles.length > 0;
	}
	startSensors() {
		this.startSensors();
	}
	stopSensors() {
		this.stopSensors();
	}
	init() {}
	instanceInit() {}
	instanceClear() {}
	instanceConstants() {}
	instanceResetUserInterface() {}
	start() {
		this.fProcessing = true;
	}
	stop() {
		this.fProcessing = false;
	}
	destroy() {
		this.fDestroyed = true;
		this.fOutputHandler = null;
		this.fInputHandler = null;
		this.fComputeHandler = null;
		this.fPlotHandler = null;
	}
};
var FaustMonoWebAudioDsp = class extends FaustBaseWebAudioDsp {
	constructor(instance, sampleRate, sampleSize, bufferSize, soundfiles) {
		super(sampleSize, bufferSize, soundfiles);
		this.fInstance = instance;
		this.fSampleRate = sampleRate;
		console.log(`sampleSize: ${sampleSize} bufferSize: ${bufferSize}`);
		this.fJSONDsp = JSON.parse(this.fInstance.json);
		FaustBaseWebAudioDsp.parseUI(this.fJSONDsp.ui, this.fUICallback);
		this.fEndMemory = this.initMemory();
		this.fInstance.api.init(this.fDSP, sampleRate);
		if (this.fSoundfiles.length > 0) {
			const allocator = new WasmAllocator(this.fInstance.memory, this.fEndMemory);
			this.initSoundfileMemory(allocator, this.fDSP);
		}
	}
	init() {
		this.fInstance.api.init(this.fDSP, this.fSampleRate);
	}
	instanceInit() {
		this.fInstance.api.instanceInit(this.fDSP, this.fSampleRate);
	}
	instanceClear() {
		this.fInstance.api.instanceClear(this.fDSP);
	}
	instanceConstants() {
		this.fInstance.api.instanceConstants(this.fDSP, this.fSampleRate);
	}
	instanceResetUserInterface() {
		this.fInstance.api.instanceResetUserInterface(this.fDSP);
	}
	initMemory() {
		this.fDSP = 0;
		const $audio = this.fJSONDsp.size;
		this.fAudioInputs = $audio;
		this.fAudioOutputs = this.fAudioInputs + this.getNumInputs() * this.fPtrSize;
		const $audioInputs = this.fAudioOutputs + this.getNumOutputs() * this.fPtrSize;
		const $audioOutputs = $audioInputs + this.getNumInputs() * this.fBufferSize * this.fSampleSize;
		const endMemory = $audioOutputs + this.getNumOutputs() * this.fBufferSize * this.fSampleSize;
		const HEAP = this.fInstance.memory.buffer;
		const HEAP32 = new Int32Array(HEAP);
		const HEAPF = this.fSampleSize === 4 ? new Float32Array(HEAP) : new Float64Array(HEAP);
		if (this.getNumInputs() > 0) {
			for (let chan = 0; chan < this.getNumInputs(); chan++) HEAP32[(this.fAudioInputs >> 2) + chan] = $audioInputs + this.fBufferSize * this.fSampleSize * chan;
			const dspInChans = HEAP32.subarray(this.fAudioInputs >> 2, this.fAudioInputs + this.getNumInputs() * this.fPtrSize >> 2);
			for (let chan = 0; chan < this.getNumInputs(); chan++) this.fInChannels[chan] = HEAPF.subarray(dspInChans[chan] >> Math.log2(this.fSampleSize), dspInChans[chan] + this.fBufferSize * this.fSampleSize >> Math.log2(this.fSampleSize));
		}
		if (this.getNumOutputs() > 0) {
			for (let chan = 0; chan < this.getNumOutputs(); chan++) HEAP32[(this.fAudioOutputs >> 2) + chan] = $audioOutputs + this.fBufferSize * this.fSampleSize * chan;
			const dspOutChans = HEAP32.subarray(this.fAudioOutputs >> 2, this.fAudioOutputs + this.getNumOutputs() * this.fPtrSize >> 2);
			for (let chan = 0; chan < this.getNumOutputs(); chan++) this.fOutChannels[chan] = HEAPF.subarray(dspOutChans[chan] >> Math.log2(this.fSampleSize), dspOutChans[chan] + this.fBufferSize * this.fSampleSize >> Math.log2(this.fSampleSize));
		}
		return endMemory;
	}
	toString() {
		return `============== Mono Memory layout ==============
        this.fBufferSize: ${this.fBufferSize}
        this.fJSONDsp.size: ${this.fJSONDsp.size}
        this.fAudioInputs: ${this.fAudioInputs}
        this.fAudioOutputs: ${this.fAudioOutputs}
        this.fDSP: ${this.fDSP}`;
	}
	compute(input, output) {
		if (this.fDestroyed) return false;
		if (!this.fProcessing) return true;
		if (this.fFirstCall) {
			this.initMemory();
			this.fFirstCall = false;
		}
		if (typeof input === "function") input(this.fInChannels);
		else {
			if (this.getNumInputs() > 0 && (!input || !input[0] || input[0].length === 0)) return true;
			if (this.getNumOutputs() > 0 && typeof output !== "function" && (!output || !output[0] || output[0].length === 0)) return true;
			if (input !== void 0) for (let chan = 0; chan < Math.min(this.getNumInputs(), input.length); chan++) this.fInChannels[chan].set(input[chan]);
		}
		if (this.fComputeHandler) this.fComputeHandler(this.fBufferSize);
		this.fInstance.api.compute(this.fDSP, this.fBufferSize, this.fAudioInputs, this.fAudioOutputs);
		this.updateOutputs();
		let forPlot = this.fOutChannels;
		if (typeof output === "function") output(this.fOutChannels);
		else {
			for (let chan = 0; chan < Math.min(this.getNumOutputs(), output.length); chan++) {
				const dspOutput = this.fOutChannels[chan];
				output[chan].set(dspOutput);
			}
			forPlot = output;
		}
		if (this.fPlotHandler) {
			this.fPlotHandler(forPlot, this.fBufferNum++, this.fCachedEvents.length ? this.fCachedEvents : void 0);
			this.fCachedEvents = [];
		}
		return true;
	}
	metadata(handler) {
		super.metadata(handler);
	}
	getNumInputs() {
		return this.fInstance.api.getNumInputs(this.fDSP);
	}
	getNumOutputs() {
		return this.fInstance.api.getNumOutputs(this.fDSP);
	}
	setParamValue(path, value) {
		if (this.fPlotHandler) this.fCachedEvents.push({
			type: "param",
			data: {
				path,
				value
			}
		});
		this.fInstance.api.setParamValue(this.fDSP, this.fPathTable[path], value);
		this.callInputParamHandler(path, this.getParamValue(path));
	}
	getParamValue(path) {
		return this.fInstance.api.getParamValue(this.fDSP, this.fPathTable[path]);
	}
	getMeta() {
		return this.fJSONDsp;
	}
	getJSON() {
		return this.fInstance.json;
	}
	getDescriptors() {
		return this.fDescriptor;
	}
	getUI() {
		return this.fJSONDsp.ui;
	}
};
var FaustWebAudioDspVoice = class _FaustWebAudioDspVoice {
	constructor($dsp, api, inputItems, pathTable, sampleRate) {
		this.fFreqLabel = [];
		this.fGateLabel = [];
		this.fGainLabel = [];
		this.fKeyLabel = [];
		this.fVelLabel = [];
		this.fCurNote = _FaustWebAudioDspVoice.kFreeVoice;
		this.fNextNote = -1;
		this.fNextVel = -1;
		this.fDate = 0;
		this.fLevel = 0;
		this.fDSP = $dsp;
		this.fAPI = api;
		this.fSampleRate = sampleRate;
		this.init(sampleRate);
		this.extractPaths(inputItems, pathTable);
	}
	static get kActiveVoice() {
		return 0;
	}
	static get kFreeVoice() {
		return -1;
	}
	static get kReleaseVoice() {
		return -2;
	}
	static get kLegatoVoice() {
		return -3;
	}
	static get kNoVoice() {
		return -4;
	}
	static get VOICE_STOP_LEVEL() {
		return 3162e-8;
	}
	static midiToFreq(note) {
		return 440 * 2 ** ((note - 69) / 12);
	}
	static normalizeVelocity(velocity) {
		return velocity / 127;
	}
	init(sampleRate) {
		this.fAPI.init(this.fDSP, sampleRate);
	}
	instanceInit() {
		this.fAPI.instanceInit(this.fDSP, this.fSampleRate);
	}
	instanceClear() {
		this.fAPI.instanceClear(this.fDSP);
	}
	instanceConstants() {
		this.fAPI.instanceConstants(this.fDSP, this.fSampleRate);
	}
	instanceResetUserInterface() {
		this.fAPI.instanceResetUserInterface(this.fDSP);
	}
	extractPaths(inputItems, pathTable) {
		inputItems.forEach((item) => {
			if (item.endsWith("/gate")) this.fGateLabel.push(pathTable[item]);
			else if (item.endsWith("/freq")) this.fFreqLabel.push(pathTable[item]);
			else if (item.endsWith("/key")) this.fKeyLabel.push(pathTable[item]);
			else if (item.endsWith("/gain")) this.fGainLabel.push(pathTable[item]);
			else if (item.endsWith("/vel") && item.endsWith("/velocity")) this.fVelLabel.push(pathTable[item]);
		});
	}
	keyOn(pitch, velocity, legato = false) {
		if (legato) {
			this.fNextNote = pitch;
			this.fNextVel = velocity;
		} else {
			this.fFreqLabel.forEach((index) => this.fAPI.setParamValue(this.fDSP, index, _FaustWebAudioDspVoice.midiToFreq(pitch)));
			this.fGateLabel.forEach((index) => this.fAPI.setParamValue(this.fDSP, index, 1));
			this.fGainLabel.forEach((index) => this.fAPI.setParamValue(this.fDSP, index, _FaustWebAudioDspVoice.normalizeVelocity(velocity)));
			this.fKeyLabel.forEach((index) => this.fAPI.setParamValue(this.fDSP, index, pitch));
			this.fVelLabel.forEach((index) => this.fAPI.setParamValue(this.fDSP, index, velocity));
			this.fCurNote = pitch;
		}
	}
	keyOff(hard = false) {
		this.fGateLabel.forEach((index) => this.fAPI.setParamValue(this.fDSP, index, 0));
		if (hard) this.fCurNote = _FaustWebAudioDspVoice.kFreeVoice;
		else this.fCurNote = _FaustWebAudioDspVoice.kReleaseVoice;
	}
	computeLegato(bufferSize, $inputs, $outputZero, $outputsHalf) {
		const size = bufferSize / 2;
		this.fGateLabel.forEach((index) => this.fAPI.setParamValue(this.fDSP, index, 0));
		this.fAPI.compute(this.fDSP, size, $inputs, $outputZero);
		this.keyOn(this.fNextNote, this.fNextVel);
		this.fAPI.compute(this.fDSP, size, $inputs, $outputsHalf);
	}
	compute(bufferSize, $inputs, $outputs) {
		this.fAPI.compute(this.fDSP, bufferSize, $inputs, $outputs);
	}
	setParamValue(index, value) {
		this.fAPI.setParamValue(this.fDSP, index, value);
	}
	getParamValue(index) {
		return this.fAPI.getParamValue(this.fDSP, index);
	}
};
var FaustPolyWebAudioDsp = class _FaustPolyWebAudioDsp extends FaustBaseWebAudioDsp {
	constructor(instance, sampleRate, sampleSize, bufferSize, soundfiles) {
		super(sampleSize, bufferSize, soundfiles);
		this.fInstance = instance;
		this.fSampleRate = sampleRate;
		console.log(`sampleSize: ${sampleSize} bufferSize: ${bufferSize}`);
		this.fJSONDsp = JSON.parse(this.fInstance.voiceJSON);
		this.fJSONEffect = this.fInstance.effectAPI && this.fInstance.effectJSON ? JSON.parse(this.fInstance.effectJSON) : null;
		FaustBaseWebAudioDsp.parseUI(this.fJSONDsp.ui, this.fUICallback);
		if (this.fJSONEffect) FaustBaseWebAudioDsp.parseUI(this.fJSONEffect.ui, this.fUICallback);
		this.fEndMemory = this.initMemory();
		this.fVoiceTable = [];
		for (let voice = 0; voice < this.fInstance.voices; voice++) this.fVoiceTable.push(new FaustWebAudioDspVoice(this.fJSONDsp.size * voice, this.fInstance.voiceAPI, this.fInputsItems, this.fPathTable, sampleRate));
		if (this.fInstance.effectAPI) this.fInstance.effectAPI.init(this.fEffect, sampleRate);
		if (this.fSoundfiles.length > 0) {
			const allocator = new WasmAllocator(this.fInstance.memory, this.fEndMemory);
			for (let voice = 0; voice < this.fInstance.voices; voice++) this.initSoundfileMemory(allocator, this.fJSONDsp.size * voice);
		}
	}
	init() {
		this.fVoiceTable.forEach((voice) => voice.init(this.fSampleRate));
		if (this.fInstance.effectAPI) this.fInstance.effectAPI.init(this.fEffect, this.fSampleRate);
	}
	instanceInit() {
		this.fVoiceTable.forEach((voice) => voice.instanceInit());
		if (this.fInstance.effectAPI) this.fInstance.effectAPI.instanceInit(this.fEffect, this.fSampleRate);
	}
	instanceClear() {
		this.fVoiceTable.forEach((voice) => voice.instanceClear());
		if (this.fInstance.effectAPI) this.fInstance.effectAPI.instanceClear(this.fEffect);
	}
	instanceConstants() {
		this.fVoiceTable.forEach((voice) => voice.instanceConstants());
		if (this.fInstance.effectAPI) this.fInstance.effectAPI.instanceConstants(this.fEffect, this.fSampleRate);
	}
	instanceResetUserInterface() {
		this.fVoiceTable.forEach((voice) => voice.instanceResetUserInterface());
		if (this.fInstance.effectAPI) this.fInstance.effectAPI.instanceResetUserInterface(this.fEffect);
	}
	initMemory() {
		this.fEffect = this.fJSONDsp.size * this.fInstance.voices;
		const $audio = this.fEffect + (this.fJSONEffect ? this.fJSONEffect.size : 0);
		this.fAudioInputs = $audio;
		this.fAudioOutputs = this.fAudioInputs + this.getNumInputs() * this.fPtrSize;
		this.fAudioMixing = this.fAudioOutputs + this.getNumOutputs() * this.fPtrSize;
		this.fAudioMixingHalf = this.fAudioMixing + this.getNumOutputs() * this.fPtrSize;
		const $audioInputs = this.fAudioMixingHalf + this.getNumOutputs() * this.fPtrSize;
		const $audioOutputs = $audioInputs + this.getNumInputs() * this.fBufferSize * this.fSampleSize;
		const $audioMixing = $audioOutputs + this.getNumOutputs() * this.fBufferSize * this.fSampleSize;
		const endMemory = $audioMixing + this.getNumOutputs() * this.fBufferSize * this.fSampleSize;
		const HEAP = this.fInstance.memory.buffer;
		const HEAP32 = new Int32Array(HEAP);
		const HEAPF = this.fSampleSize === 4 ? new Float32Array(HEAP) : new Float64Array(HEAP);
		if (this.getNumInputs() > 0) {
			for (let chan = 0; chan < this.getNumInputs(); chan++) HEAP32[(this.fAudioInputs >> 2) + chan] = $audioInputs + this.fBufferSize * this.fSampleSize * chan;
			const dspInChans = HEAP32.subarray(this.fAudioInputs >> 2, this.fAudioInputs + this.getNumInputs() * this.fPtrSize >> 2);
			for (let chan = 0; chan < this.getNumInputs(); chan++) this.fInChannels[chan] = HEAPF.subarray(dspInChans[chan] >> Math.log2(this.fSampleSize), dspInChans[chan] + this.fBufferSize * this.fSampleSize >> Math.log2(this.fSampleSize));
		}
		if (this.getNumOutputs() > 0) {
			for (let chan = 0; chan < this.getNumOutputs(); chan++) {
				HEAP32[(this.fAudioOutputs >> 2) + chan] = $audioOutputs + this.fBufferSize * this.fSampleSize * chan;
				HEAP32[(this.fAudioMixing >> 2) + chan] = $audioMixing + this.fBufferSize * this.fSampleSize * chan;
				HEAP32[(this.fAudioMixingHalf >> 2) + chan] = $audioMixing + this.fBufferSize * this.fSampleSize * chan + this.fBufferSize / 2 * this.fSampleSize;
			}
			const dspOutChans = HEAP32.subarray(this.fAudioOutputs >> 2, this.fAudioOutputs + this.getNumOutputs() * this.fPtrSize >> 2);
			for (let chan = 0; chan < this.getNumOutputs(); chan++) this.fOutChannels[chan] = HEAPF.subarray(dspOutChans[chan] >> Math.log2(this.fSampleSize), dspOutChans[chan] + this.fBufferSize * this.fSampleSize >> Math.log2(this.fSampleSize));
		}
		return endMemory;
	}
	toString() {
		return `============== Poly Memory layout ==============
        this.fBufferSize: ${this.fBufferSize}
        this.fJSONDsp.size: ${this.fJSONDsp.size}
        this.fAudioInputs: ${this.fAudioInputs}
        this.fAudioOutputs: ${this.fAudioOutputs}
        this.fAudioMixing: ${this.fAudioMixing}
        this.fAudioMixingHalf: ${this.fAudioMixingHalf}`;
	}
	allocVoice(voice, type) {
		this.fVoiceTable[voice].fDate++;
		this.fVoiceTable[voice].fCurNote = type;
		return voice;
	}
	getPlayingVoice(pitch) {
		let voicePlaying = FaustWebAudioDspVoice.kNoVoice;
		let oldestDatePlaying = Number.MAX_VALUE;
		for (let i = 0; i < this.fInstance.voices; i++) {
			const curNote = this.fVoiceTable[i].fCurNote;
			const nextNote = this.fVoiceTable[i].fNextNote;
			if (curNote === pitch || curNote === FaustWebAudioDspVoice.kLegatoVoice && nextNote === pitch) {
				if (this.fVoiceTable[i].fDate < oldestDatePlaying) {
					oldestDatePlaying = this.fVoiceTable[i].fDate;
					voicePlaying = i;
				}
			}
		}
		return voicePlaying;
	}
	getFreeVoice() {
		for (let voice = 0; voice < this.fInstance.voices; voice++) if (this.fVoiceTable[voice].fCurNote === FaustWebAudioDspVoice.kFreeVoice) return this.allocVoice(voice, FaustWebAudioDspVoice.kActiveVoice);
		let voiceRelease = FaustWebAudioDspVoice.kNoVoice;
		let voicePlaying = FaustWebAudioDspVoice.kNoVoice;
		let oldestDateRelease = Number.MAX_VALUE;
		let oldestDatePlaying = Number.MAX_VALUE;
		for (let voice = 0; voice < this.fInstance.voices; voice++) if (this.fVoiceTable[voice].fCurNote === FaustWebAudioDspVoice.kReleaseVoice) {
			if (this.fVoiceTable[voice].fDate < oldestDateRelease) {
				oldestDateRelease = this.fVoiceTable[voice].fDate;
				voiceRelease = voice;
			}
		} else if (this.fVoiceTable[voice].fDate < oldestDatePlaying) {
			oldestDatePlaying = this.fVoiceTable[voice].fDate;
			voicePlaying = voice;
		}
		if (oldestDateRelease !== Number.MAX_VALUE) {
			console.log(`Steal release voice : voice_date = ${this.fVoiceTable[voiceRelease].fDate} voice = ${voiceRelease}`);
			return this.allocVoice(voiceRelease, FaustWebAudioDspVoice.kLegatoVoice);
		}
		if (oldestDatePlaying !== Number.MAX_VALUE) {
			console.log(`Steal playing voice : voice_date = ${this.fVoiceTable[voicePlaying].fDate} voice = ${voicePlaying}`);
			return this.allocVoice(voicePlaying, FaustWebAudioDspVoice.kLegatoVoice);
		}
		return FaustWebAudioDspVoice.kNoVoice;
	}
	compute(input, output) {
		if (this.fDestroyed) return false;
		if (this.fFirstCall) {
			this.initMemory();
			this.fFirstCall = false;
		}
		if (!this.fProcessing) return true;
		if (this.getNumInputs() > 0 && (!input || !input[0] || input[0].length === 0)) return true;
		if (this.getNumOutputs() > 0 && (!output || !output[0] || output[0].length === 0)) return true;
		if (input !== void 0) for (let chan = 0; chan < Math.min(this.getNumInputs(), input.length); ++chan) this.fInChannels[chan].set(input[chan]);
		if (this.fComputeHandler) this.fComputeHandler(this.fBufferSize);
		this.fInstance.mixerAPI.clearOutput(this.fBufferSize, this.getNumOutputs(), this.fAudioOutputs);
		this.fVoiceTable.forEach((voice) => {
			if (voice.fCurNote === FaustWebAudioDspVoice.kLegatoVoice) {
				voice.computeLegato(this.fBufferSize, this.fAudioInputs, this.fAudioMixing, this.fAudioMixingHalf);
				this.fInstance.mixerAPI.fadeOut(this.fBufferSize / 2, this.getNumOutputs(), this.fAudioMixing);
				voice.fLevel = this.fInstance.mixerAPI.mixCheckVoice(this.fBufferSize, this.getNumOutputs(), this.fAudioMixing, this.fAudioOutputs);
			} else if (voice.fCurNote !== FaustWebAudioDspVoice.kFreeVoice) {
				voice.compute(this.fBufferSize, this.fAudioInputs, this.fAudioMixing);
				voice.fLevel = this.fInstance.mixerAPI.mixCheckVoice(this.fBufferSize, this.getNumOutputs(), this.fAudioMixing, this.fAudioOutputs);
				if (voice.fCurNote == FaustWebAudioDspVoice.kReleaseVoice && voice.fLevel < FaustWebAudioDspVoice.VOICE_STOP_LEVEL) voice.fCurNote = FaustWebAudioDspVoice.kFreeVoice;
			}
		});
		if (this.fInstance.effectAPI) this.fInstance.effectAPI.compute(this.fEffect, this.fBufferSize, this.fAudioOutputs, this.fAudioOutputs);
		this.updateOutputs();
		if (output !== void 0) {
			for (let chan = 0; chan < Math.min(this.getNumOutputs(), output.length); chan++) {
				const dspOutput = this.fOutChannels[chan];
				output[chan].set(dspOutput);
			}
			if (this.fPlotHandler) {
				this.fPlotHandler(output, this.fBufferNum++, this.fCachedEvents.length ? this.fCachedEvents : void 0);
				this.fCachedEvents = [];
			}
		}
		return true;
	}
	getNumInputs() {
		return this.fInstance.voiceAPI.getNumInputs(0);
	}
	getNumOutputs() {
		return this.fInstance.voiceAPI.getNumOutputs(0);
	}
	static findPath(o, p) {
		if (typeof o !== "object") return false;
		else if (o.address) return o.address === p;
		else {
			for (const k in o) if (_FaustPolyWebAudioDsp.findPath(o[k], p)) return true;
			return false;
		}
	}
	setParamValue(path, value) {
		if (this.fPlotHandler) this.fCachedEvents.push({
			type: "param",
			data: {
				path,
				value
			}
		});
		if (this.fJSONEffect && _FaustPolyWebAudioDsp.findPath(this.fJSONEffect.ui, path) && this.fInstance.effectAPI) this.fInstance.effectAPI.setParamValue(this.fEffect, this.fPathTable[path], value);
		else this.fVoiceTable.forEach((voice) => voice.setParamValue(this.fPathTable[path], value));
		this.callInputParamHandler(path, this.getParamValue(path));
	}
	getParamValue(path) {
		if (this.fJSONEffect && _FaustPolyWebAudioDsp.findPath(this.fJSONEffect.ui, path) && this.fInstance.effectAPI) return this.fInstance.effectAPI.getParamValue(this.fEffect, this.fPathTable[path]);
		else return this.fVoiceTable[0].getParamValue(this.fPathTable[path]);
	}
	getMeta() {
		const o = this.fJSONDsp;
		const e = this.fJSONEffect;
		const r = { ...o };
		if (e) r.ui = [{
			type: "tgroup",
			label: "Sequencer",
			items: [{
				type: "vgroup",
				label: "Instrument",
				items: o.ui
			}, {
				type: "vgroup",
				label: "Effect",
				items: e.ui
			}]
		}];
		else r.ui = [{
			type: "tgroup",
			label: "Polyphonic",
			items: [{
				type: "vgroup",
				label: "Voices",
				items: o.ui
			}]
		}];
		return r;
	}
	getJSON() {
		return JSON.stringify(this.getMeta());
	}
	getUI() {
		return this.getMeta().ui;
	}
	getDescriptors() {
		return this.fDescriptor;
	}
	midiMessage(data) {
		const cmd = data[0] >> 4;
		const channel = data[0] & 15;
		const data1 = data[1];
		const data2 = data[2];
		if (cmd === 8 || cmd === 9 && data2 === 0) return this.keyOff(channel, data1, data2);
		else if (cmd === 9) return this.keyOn(channel, data1, data2);
		else super.midiMessage(data);
	}
	ctrlChange(channel, ctrl, value) {
		if (ctrl === 123 || ctrl === 120) this.allNotesOff(true);
		else super.ctrlChange(channel, ctrl, value);
	}
	keyOn(channel, pitch, velocity) {
		if (this.fPlotHandler) this.fCachedEvents.push({
			type: "keyOn",
			data: [
				channel,
				pitch,
				velocity
			]
		});
		const voice = this.getFreeVoice();
		this.fVoiceTable[voice].keyOn(pitch, velocity, this.fVoiceTable[voice].fCurNote == FaustWebAudioDspVoice.kLegatoVoice);
	}
	keyOff(channel, pitch, velocity) {
		if (this.fPlotHandler) this.fCachedEvents.push({
			type: "keyOff",
			data: [
				channel,
				pitch,
				velocity
			]
		});
		const voice = this.getPlayingVoice(pitch);
		if (voice !== FaustWebAudioDspVoice.kNoVoice) this.fVoiceTable[voice].keyOff();
		else console.log("Playing pitch = %d not found\n", pitch);
	}
	allNotesOff(hard = true) {
		this.fCachedEvents.push({
			type: "ctrlChange",
			data: [
				0,
				123,
				0
			]
		});
		this.fVoiceTable.forEach((voice) => voice.keyOff(hard));
	}
};
var FaustOfflineProcessor = class {
	constructor(instance, bufferSize) {
		this.fDSPCode = instance;
		this.fBufferSize = bufferSize;
		this.fInputs = new Array(this.fDSPCode.getNumInputs()).fill(null).map(() => new Float32Array(bufferSize));
		this.fOutputs = new Array(this.fDSPCode.getNumOutputs()).fill(null).map(() => new Float32Array(bufferSize));
	}
	getParameterDescriptors() {
		const params = [];
		const callback = (item) => {
			let param = null;
			const isPolyReserved = "address" in item && !![
				"/gate",
				"/freq",
				"/gain",
				"/key",
				"/vel",
				"/velocity"
			].find((k) => item.address.endsWith(k));
			if (this.fDSPCode instanceof FaustMonoWebAudioDsp || !isPolyReserved) {
				if (item.type === "vslider" || item.type === "hslider" || item.type === "nentry") param = {
					name: item.address,
					defaultValue: item.init || 0,
					minValue: item.min || 0,
					maxValue: item.max || 0
				};
				else if (item.type === "button" || item.type === "checkbox") param = {
					name: item.address,
					defaultValue: item.init || 0,
					minValue: 0,
					maxValue: 1
				};
			}
			if (param) params.push(param);
		};
		FaustBaseWebAudioDsp.parseUI(this.fDSPCode.getUI(), callback);
		return params;
	}
	compute(input, output) {
		return this.fDSPCode.compute(input, output);
	}
	setOutputParamHandler(handler) {
		this.fDSPCode.setOutputParamHandler(handler);
	}
	getOutputParamHandler() {
		return this.fDSPCode.getOutputParamHandler();
	}
	callOutputParamHandler(path, value) {
		this.fDSPCode.callOutputParamHandler(path, value);
	}
	setInputParamHandler(handler) {
		this.fDSPCode.setInputParamHandler(handler);
	}
	getInputParamHandler() {
		return this.fDSPCode.getInputParamHandler();
	}
	callInputParamHandler(path, value) {
		this.fDSPCode.callInputParamHandler(path, value);
	}
	setComputeHandler(handler) {
		this.fDSPCode.setComputeHandler(handler);
	}
	getComputeHandler() {
		return this.fDSPCode.getComputeHandler();
	}
	setPlotHandler(handler) {
		this.fDSPCode.setPlotHandler(handler);
	}
	getPlotHandler() {
		return this.fDSPCode.getPlotHandler();
	}
	getNumInputs() {
		return this.fDSPCode.getNumInputs();
	}
	getNumOutputs() {
		return this.fDSPCode.getNumOutputs();
	}
	metadata(handler) {}
	midiMessage(data) {
		this.fDSPCode.midiMessage(data);
	}
	ctrlChange(chan, ctrl, value) {
		this.fDSPCode.ctrlChange(chan, ctrl, value);
	}
	pitchWheel(chan, value) {
		this.fDSPCode.pitchWheel(chan, value);
	}
	keyOn(channel, pitch, velocity) {
		this.fDSPCode.keyOn(channel, pitch, velocity);
	}
	keyOff(channel, pitch, velocity) {
		this.fDSPCode.keyOff(channel, pitch, velocity);
	}
	setParamValue(path, value) {
		this.fDSPCode.setParamValue(path, value);
	}
	getParamValue(path) {
		return this.fDSPCode.getParamValue(path);
	}
	getParams() {
		return this.fDSPCode.getParams();
	}
	getMeta() {
		return this.fDSPCode.getMeta();
	}
	getJSON() {
		return this.fDSPCode.getJSON();
	}
	getDescriptors() {
		return this.fDSPCode.getDescriptors();
	}
	getUI() {
		return this.fDSPCode.getUI();
	}
	init() {
		this.fDSPCode.init();
	}
	instanceInit() {
		this.fDSPCode.instanceInit();
	}
	instanceClear() {
		this.fDSPCode.instanceClear();
	}
	instanceConstants() {
		this.fDSPCode.instanceConstants();
	}
	instanceResetUserInterface() {
		this.fDSPCode.instanceResetUserInterface();
	}
	start() {
		this.fDSPCode.start();
	}
	stop() {
		this.fDSPCode.stop();
	}
	destroy() {
		this.fDSPCode.destroy();
	}
	get hasAccInput() {
		return this.fDSPCode.hasAccInput;
	}
	propagateAcc(accelerationIncludingGravity, invert = false) {
		this.fDSPCode.propagateAcc(accelerationIncludingGravity, invert);
	}
	get hasGyrInput() {
		return this.fDSPCode.hasGyrInput;
	}
	propagateGyr(event) {
		this.fDSPCode.propagateGyr(event);
	}
	startSensors() {}
	stopSensors() {}
	/**
	* Render frames in an array.
	*
	* @param inputs - input signal
	* @param length - the number of frames to render (default: bufferSize)
	* @param onUpdate - a callback after each buffer calculated, with an argument "current sample"
	* @return an array of Float32Array with the rendered frames
	*/
	render(inputs = [], length = this.fBufferSize, onUpdate) {
		let l = 0;
		const outputs = new Array(this.fDSPCode.getNumOutputs()).fill(null).map(() => new Float32Array(length));
		this.fDSPCode.start();
		while (l < length) {
			const sliceLength = Math.min(length - l, this.fBufferSize);
			for (let i = 0; i < this.fDSPCode.getNumInputs(); i++) {
				let input;
				if (inputs[i]) if (inputs[i].length <= l) input = new Float32Array(sliceLength);
				else if (inputs[i].length > l + sliceLength) input = inputs[i].subarray(l, l + sliceLength);
				else input = inputs[i].subarray(l, inputs[i].length);
				else input = new Float32Array(sliceLength);
				this.fInputs[i] = input;
			}
			this.fDSPCode.compute(this.fInputs, this.fOutputs);
			for (let i = 0; i < this.fDSPCode.getNumOutputs(); i++) {
				const output = this.fOutputs[i];
				if (sliceLength < this.fBufferSize) outputs[i].set(output.subarray(0, sliceLength), l);
				else outputs[i].set(output, l);
			}
			l += sliceLength;
			onUpdate?.(l);
		}
		this.fDSPCode.stop();
		return outputs;
	}
};
var FaustMonoOfflineProcessor = class extends FaustOfflineProcessor {};
var FaustPolyOfflineProcessor = class extends FaustOfflineProcessor {
	keyOn(channel, pitch, velocity) {
		this.fDSPCode.keyOn(channel, pitch, velocity);
	}
	keyOff(channel, pitch, velocity) {
		this.fDSPCode.keyOff(channel, pitch, velocity);
	}
	allNotesOff(hard) {
		this.fDSPCode.allNotesOff(hard);
	}
};
var LibFaust = class {
	constructor(module) {
		this.fModule = module;
		this.fCompiler = new module.libFaustWasm();
		this.fFileSystem = this.fModule.FS;
	}
	module() {
		return this.fModule;
	}
	fs() {
		return this.fFileSystem;
	}
	version() {
		return this.fCompiler.version();
	}
	createDSPFactory(name, code, args, useInternalMemory) {
		return this.fCompiler.createDSPFactory(name, code, args, useInternalMemory);
	}
	deleteDSPFactory(cFactory) {
		return this.fCompiler.deleteDSPFactory(cFactory);
	}
	expandDSP(name, code, args) {
		return this.fCompiler.expandDSP(name, code, args);
	}
	generateAuxFiles(name, code, args) {
		return this.fCompiler.generateAuxFiles(name, code, args);
	}
	deleteAllDSPFactories() {
		return this.fCompiler.deleteAllDSPFactories();
	}
	getErrorAfterException() {
		return this.fCompiler.getErrorAfterException();
	}
	cleanupAfterException() {
		return this.fCompiler.cleanupAfterException();
	}
	getInfos(what) {
		return this.fCompiler.getInfos(what);
	}
	toString() {
		return `LibFaust module: ${this.fModule}, compiler: ${this.fCompiler}`;
	}
};
var LibFaust_default = LibFaust;
var SoundfileReader = class {
	/**
	* Set fallback base URLs used to resolve soundfile paths.
	*
	* In Node or other non-browser runtimes, `location` may be undefined;
	* in that case this returns an empty list to avoid resolution errors.
	*/
	static get fallbackPaths() {
		const loc = typeof location !== "undefined" ? location : null;
		const href = loc == null ? void 0 : loc.href;
		const origin = loc == null ? void 0 : loc.origin;
		return [
			href,
			href ? this.getParentUrl(href) : null,
			origin
		].filter((value) => typeof value === "string" && value.length > 0);
	}
	/**
	* Extract the parent URL from an URL.
	* @param url : the URL
	* @returns : the parent URL
	*/
	static getParentUrl(url) {
		return url.substring(0, url.lastIndexOf("/") + 1);
	}
	/**
	* Convert an audio buffer to audio data.
	*
	* @param audioBuffer : the audio buffer to convert
	* @returns : the audio data
	*/
	static toAudioData(audioBuffer) {
		const { sampleRate, numberOfChannels } = audioBuffer;
		return {
			sampleRate,
			audioBuffer: new Array(numberOfChannels).fill(null).map((v, i) => audioBuffer.getChannelData(i))
		};
	}
	/**
	* Extract the URLs from the metadata.
	*
	* @param dspMeta : the metadata
	* @returns : the URLs
	*/
	static findSoundfilesFromMeta(dspMeta) {
		const soundfiles = {};
		const callback = (item) => {
			if (item.type === "soundfile") FaustBaseWebAudioDsp.splitSoundfileNames(item.url).filter((url) => url.trim().length > 0).forEach((url) => soundfiles[url] = null);
		};
		FaustBaseWebAudioDsp.parseUI(dspMeta.ui, callback);
		return soundfiles;
	}
	/**
	* Fetch the soundfile.
	*
	* @param url : the url of the soundfile
	* @param audioCtx : the audio context
	* @returns : the audio data
	*/
	static async fetchSoundfile(url, audioCtx) {
		console.log(`Loading sound file from ${url}`);
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Failed to load sound file from ${url}: ${response.statusText}`);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
		return this.toAudioData(audioBuffer);
	}
	/**
	* Load the soundfile.
	*
	* @param filename : the filename
	* @param metaUrls : the metadata URLs
	* @param soundfiles : the soundfiles
	* @param audioCtx : the audio context
	*/
	static async loadSoundfile(filename, metaUrls, soundfiles, audioCtx) {
		if (soundfiles == null ? void 0 : soundfiles[filename]) return;
		const urlsToCheck = [filename, ...[...metaUrls, ...this.fallbackPaths].map((path) => new URL(filename, path.endsWith("/") ? path : `${path}/`).href)];
		let lastError = null;
		for (const url of urlsToCheck) try {
			soundfiles[filename] = await this.fetchSoundfile(url, audioCtx);
			return;
		} catch (error) {
			lastError = error;
		}
		throw new Error(`Failed to load sound file ${filename}, all check failed. Last error: ${String(lastError)}`);
	}
	/**
	* Load the soundfiles, public API.
	*
	* @param dspMeta : the metadata
	* @param soundfilesIn : the soundfiles
	* @param audioCtx : the audio context
	* @returns : the soundfiles
	*/
	static async loadSoundfiles(dspMeta, soundfilesIn, audioCtx) {
		const metaUrls = FaustBaseWebAudioDsp.extractUrlsFromMeta(dspMeta);
		const soundfiles = this.findSoundfilesFromMeta(dspMeta);
		for (const id in soundfiles) {
			if (soundfilesIn == null ? void 0 : soundfilesIn[id]) {
				soundfiles[id] = soundfilesIn[id];
				continue;
			}
			try {
				await this.loadSoundfile(id, metaUrls, soundfiles, audioCtx);
			} catch (error) {
				console.error(error);
			}
		}
		return soundfiles;
	}
};
var SoundfileReader_default = SoundfileReader;
var FaustAudioWorkletCommunicator = class {
	constructor(port) {
		this.port = port;
		this.supportSharedArrayBuffer = !!globalThis.SharedArrayBuffer;
		this.byteLength = 4 * Uint8Array.BYTES_PER_ELEMENT + 3 * Float32Array.BYTES_PER_ELEMENT + 3 * Float32Array.BYTES_PER_ELEMENT;
	}
	initializeBuffer(ab) {
		let ptr = 0;
		this.uin8Invert = new Uint8ClampedArray(ab, ptr, 1);
		ptr += Uint8ClampedArray.BYTES_PER_ELEMENT;
		this.uin8NewAccData = new Uint8ClampedArray(ab, ptr, 1);
		ptr += Uint8ClampedArray.BYTES_PER_ELEMENT;
		this.uin8NewGyrData = new Uint8ClampedArray(ab, ptr, 1);
		ptr += Uint8ClampedArray.BYTES_PER_ELEMENT;
		ptr += Uint8ClampedArray.BYTES_PER_ELEMENT;
		this.f32Acc = new Float32Array(ab, ptr, 3);
		ptr += 3 * Float32Array.BYTES_PER_ELEMENT;
		this.f32Gyr = new Float32Array(ab, ptr, 3);
		ptr += 3 * Float32Array.BYTES_PER_ELEMENT;
	}
	setNewAccDataAvailable(value) {
		if (!this.uin8NewAccData) return;
		this.uin8NewAccData[0] = +value;
	}
	getNewAccDataAvailable() {
		var _a;
		return !!((_a = this.uin8NewAccData) == null ? void 0 : _a[0]);
	}
	setNewGyrDataAvailable(value) {
		if (!this.uin8NewGyrData) return;
		this.uin8NewGyrData[0] = +value;
	}
	getNewGyrDataAvailable() {
		var _a;
		return !!((_a = this.uin8NewGyrData) == null ? void 0 : _a[0]);
	}
	setAcc({ x, y, z }, invert = false) {
		if (!this.supportSharedArrayBuffer) {
			const e = {
				type: "acc",
				data: {
					x,
					y,
					z
				},
				invert
			};
			this.port.postMessage(e);
		}
		if (!this.uin8NewAccData) return;
		this.uin8Invert[0] = +invert;
		this.f32Acc[0] = x;
		this.f32Acc[1] = y;
		this.f32Acc[2] = z;
		this.uin8NewAccData[0] = 1;
	}
	getAcc() {
		if (!this.uin8NewAccData) return;
		const invert = !!this.uin8Invert[0];
		const [x, y, z] = this.f32Acc;
		return {
			x,
			y,
			z,
			invert
		};
	}
	setGyr({ alpha, beta, gamma }) {
		if (!this.supportSharedArrayBuffer) {
			const e = {
				type: "gyr",
				data: {
					alpha,
					beta,
					gamma
				}
			};
			this.port.postMessage(e);
		}
		if (!this.uin8NewGyrData) return;
		this.f32Gyr[0] = alpha;
		this.f32Gyr[1] = beta;
		this.f32Gyr[2] = gamma;
		this.uin8NewGyrData[0] = 1;
	}
	getGyr() {
		if (!this.uin8NewGyrData) return;
		const [alpha, beta, gamma] = this.f32Gyr;
		return {
			alpha,
			beta,
			gamma
		};
	}
};
var FaustAudioWorkletNodeCommunicator = class extends FaustAudioWorkletCommunicator {
	constructor(port) {
		super(port);
		if (this.supportSharedArrayBuffer) {
			const sab = new SharedArrayBuffer(this.byteLength);
			this.initializeBuffer(sab);
			this.port.postMessage({
				type: "initSab",
				sab
			});
		} else {
			const ab = new ArrayBuffer(this.byteLength);
			this.initializeBuffer(ab);
		}
	}
};
var FaustAudioWorkletProcessorCommunicator = class extends FaustAudioWorkletCommunicator {
	constructor(port) {
		super(port);
		if (this.supportSharedArrayBuffer) this.port.addEventListener("message", (event) => {
			const { data } = event;
			if (data.type === "initSab") this.initializeBuffer(data.sab);
		});
		else {
			const ab = new ArrayBuffer(this.byteLength);
			this.initializeBuffer(ab);
			this.port.addEventListener("message", (event) => {
				const msg = event.data;
				switch (msg.type) {
					case "acc":
						this.setAcc(msg.data, msg.invert);
						break;
					case "gyr":
						this.setGyr(msg.data);
						break;
					default: break;
				}
			});
		}
	}
};
var _hasAccInput, _hasGyrInput;
var FaustAudioWorkletNode = class extends (globalThis.AudioWorkletNode || null) {
	constructor(context, name, factory, options = {}) {
		const JSONObj = JSON.parse(factory.json);
		super(context, name, {
			numberOfInputs: JSONObj.inputs > 0 ? 1 : 0,
			numberOfOutputs: JSONObj.outputs > 0 ? 1 : 0,
			channelCount: Math.max(1, JSONObj.inputs),
			outputChannelCount: [JSONObj.outputs],
			channelCountMode: "explicit",
			channelInterpretation: "speakers",
			processorOptions: options.processorOptions,
			...options
		});
		__privateAdd(this, _hasAccInput, false);
		__privateAdd(this, _hasGyrInput, false);
		this.handleMessageAux = (e) => {
			if (e.data.type === "out-param" && this.fOutputHandler) this.fOutputHandler(e.data.path, e.data.value);
			else if (e.data.type === "in-param" && this.fInputHandler) this.fInputHandler(e.data.path, e.data.value);
			else if (e.data.type === "plot" && this.fPlotHandler) this.fPlotHandler(e.data.value, e.data.index, e.data.events);
		};
		this.handleDeviceMotion = ({ accelerationIncludingGravity }) => {
			const isAndroid = /Android/i.test(navigator.userAgent);
			if (!accelerationIncludingGravity) return;
			const { x, y, z } = accelerationIncludingGravity;
			this.propagateAcc({
				x,
				y,
				z
			}, isAndroid);
		};
		this.handleDeviceOrientation = ({ alpha, beta, gamma }) => {
			this.propagateGyr({
				alpha,
				beta,
				gamma
			});
		};
		this.fJSONDsp = JSONObj;
		this.fJSON = factory.json;
		this.fOutputHandler = null;
		this.fInputHandler = null;
		this.fComputeHandler = null;
		this.fPlotHandler = null;
		this.fDescriptor = [];
		this.fParamAliases = {};
		this.fInputsItems = [];
		this.fUICallback = (item) => {
			if (item.type === "vslider" || item.type === "hslider" || item.type === "button" || item.type === "checkbox" || item.type === "nentry") {
				this.fInputsItems.push(item.address);
				this.fDescriptor.push(item);
				const registerAlias = (alias) => {
					if (!this.fParamAliases[alias]) this.fParamAliases[alias] = item.address;
				};
				registerAlias(item.shortname);
				registerAlias(item.label);
				if (!item.meta) return;
				item.meta.forEach((meta) => {
					const { midi, acc, gyr } = meta;
					if (acc) __privateSet(this, _hasAccInput, true);
					if (gyr) __privateSet(this, _hasGyrInput, true);
				});
			}
		};
		FaustBaseWebAudioDsp.parseUI(this.fJSONDsp.ui, this.fUICallback);
		this.fCommunicator = new FaustAudioWorkletNodeCommunicator(this.port);
		this.port.addEventListener("message", this.handleMessageAux);
		this.port.start();
	}
	/** Setup accelerometer and gyroscope handlers */
	async startSensors() {
		if (this.hasAccInput) if (window.DeviceMotionEvent) window.addEventListener("devicemotion", this.handleDeviceMotion, true);
		else console.log("Cannot set the accelerometer handler.");
		if (this.hasGyrInput) if (window.DeviceMotionEvent) window.addEventListener("deviceorientation", this.handleDeviceOrientation, true);
		else console.log("Cannot set the gyroscope handler.");
	}
	stopSensors() {
		if (this.hasAccInput) window.removeEventListener("devicemotion", this.handleDeviceMotion, true);
		if (this.hasGyrInput) window.removeEventListener("deviceorientation", this.handleDeviceOrientation, true);
	}
	setOutputParamHandler(handler) {
		this.fOutputHandler = handler;
	}
	getOutputParamHandler() {
		return this.fOutputHandler;
	}
	callOutputParamHandler(path, value) {
		if (this.fOutputHandler) this.fOutputHandler(path, value);
	}
	setInputParamHandler(handler) {
		this.fInputHandler = handler;
	}
	getInputParamHandler() {
		return this.fInputHandler;
	}
	callInputParamHandler(path, value) {
		if (this.fInputHandler) this.fInputHandler(path, value);
	}
	setComputeHandler(handler) {
		this.fComputeHandler = handler;
	}
	getComputeHandler() {
		return this.fComputeHandler;
	}
	setPlotHandler(handler) {
		this.fPlotHandler = handler;
		if (this.fPlotHandler) this.port.postMessage({
			type: "setPlotHandler",
			data: true
		});
		else this.port.postMessage({
			type: "setPlotHandler",
			data: false
		});
	}
	getPlotHandler() {
		return this.fPlotHandler;
	}
	setupWamEventHandler() {
		this.port.postMessage({ type: "setupWamEventHandler" });
	}
	getNumInputs() {
		return this.fJSONDsp.inputs;
	}
	getNumOutputs() {
		return this.fJSONDsp.outputs;
	}
	compute(inputs, outputs) {
		return false;
	}
	metadata(handler) {
		if (this.fJSONDsp.meta) this.fJSONDsp.meta.forEach((meta) => handler(Object.keys(meta)[0], meta[Object.keys(meta)[0]]));
	}
	midiMessage(data) {
		const cmd = data[0] >> 4;
		const channel = data[0] & 15;
		const data1 = data[1];
		const data2 = data[2];
		if (cmd === 11) this.ctrlChange(channel, data1, data2);
		else if (cmd === 14) this.pitchWheel(channel, data2 * 128 + data1);
		if (cmd === 8 || cmd === 9 && data2 === 0) this.keyOff(channel, data1, data2);
		else if (cmd === 9) this.keyOn(channel, data1, data2);
		else this.port.postMessage({
			type: "midi",
			data
		});
	}
	ctrlChange(channel, ctrl, value) {
		const e = {
			type: "ctrlChange",
			data: [
				channel,
				ctrl,
				value
			]
		};
		this.port.postMessage(e);
	}
	pitchWheel(channel, wheel) {
		const e = {
			type: "pitchWheel",
			data: [channel, wheel]
		};
		this.port.postMessage(e);
	}
	keyOn(channel, pitch, velocity) {
		const e = {
			type: "keyOn",
			data: [
				channel,
				pitch,
				velocity
			]
		};
		this.port.postMessage(e);
	}
	keyOff(channel, pitch, velocity) {
		const e = {
			type: "keyOff",
			data: [
				channel,
				pitch,
				velocity
			]
		};
		this.port.postMessage(e);
	}
	get hasAccInput() {
		return __privateGet(this, _hasAccInput);
	}
	propagateAcc(accelerationIncludingGravity, invert = false) {
		if (!accelerationIncludingGravity) return;
		const { x, y, z } = accelerationIncludingGravity;
		this.fCommunicator.setAcc({
			x,
			y,
			z
		}, invert);
	}
	get hasGyrInput() {
		return __privateGet(this, _hasGyrInput);
	}
	propagateGyr(event) {
		if (!event) return;
		const { alpha, beta, gamma } = event;
		this.fCommunicator.setGyr({
			alpha,
			beta,
			gamma
		});
	}
	setParamValue(path, value) {
		const resolved = this.fParamAliases[path] || path;
		this.port.postMessage({
			type: "param",
			data: {
				path: resolved,
				value
			}
		});
		const param = this.parameters.get(resolved);
		if (param) param.setValueAtTime(value, this.context.currentTime);
	}
	getParamValue(path) {
		const resolved = this.fParamAliases[path] || path;
		const param = this.parameters.get(resolved);
		return param ? param.value : 0;
	}
	getParams() {
		return this.fInputsItems;
	}
	getMeta() {
		return this.fJSONDsp;
	}
	getJSON() {
		return JSON.stringify(this.getMeta());
	}
	getUI() {
		return this.fJSONDsp.ui;
	}
	getDescriptors() {
		return this.fDescriptor;
	}
	init() {
		this.port.postMessage({ type: "init" });
	}
	instanceInit() {
		this.port.postMessage({ type: "instanceInit" });
	}
	instanceClear() {
		this.port.postMessage({ type: "instanceClear" });
	}
	instanceConstants() {
		this.port.postMessage({ type: "instanceConstants" });
	}
	instanceResetUserInterface() {
		this.port.postMessage({ type: "instanceResetUserInterface" });
	}
	start() {
		this.port.postMessage({ type: "start" });
	}
	stop() {
		this.port.postMessage({ type: "stop" });
	}
	destroy() {
		this.port.postMessage({ type: "destroy" });
		this.port.close();
	}
};
_hasAccInput = /* @__PURE__ */ new WeakMap();
_hasGyrInput = /* @__PURE__ */ new WeakMap();
var FaustMonoAudioWorkletNode = class extends FaustAudioWorkletNode {
	constructor(context, options) {
		super(context, options.processorOptions.name, options.processorOptions.factory, options);
		this.onprocessorerror = (e) => {
			throw e;
		};
	}
};
var FaustPolyAudioWorkletNode = class extends FaustAudioWorkletNode {
	constructor(context, options) {
		super(context, options.processorOptions.name, options.processorOptions.voiceFactory, options);
		this.onprocessorerror = (e) => {
			throw e;
		};
		this.fJSONEffect = options.processorOptions.effectFactory ? JSON.parse(options.processorOptions.effectFactory.json) : null;
		if (this.fJSONEffect) FaustBaseWebAudioDsp.parseUI(this.fJSONEffect.ui, this.fUICallback);
	}
	keyOn(channel, pitch, velocity) {
		const e = {
			type: "keyOn",
			data: [
				channel,
				pitch,
				velocity
			]
		};
		this.port.postMessage(e);
	}
	keyOff(channel, pitch, velocity) {
		const e = {
			type: "keyOff",
			data: [
				channel,
				pitch,
				velocity
			]
		};
		this.port.postMessage(e);
	}
	allNotesOff(hard) {
		this.port.postMessage({
			type: "ctrlChange",
			data: [
				0,
				123,
				0
			]
		});
	}
	getMeta() {
		const o = this.fJSONDsp;
		const e = this.fJSONEffect;
		const r = { ...o };
		if (e) r.ui = [{
			type: "tgroup",
			label: "Sequencer",
			items: [{
				type: "vgroup",
				label: "Instrument",
				items: o.ui
			}, {
				type: "vgroup",
				label: "Effect",
				items: e.ui
			}]
		}];
		else r.ui = [{
			type: "tgroup",
			label: "Polyphonic",
			items: [{
				type: "vgroup",
				label: "Voices",
				items: o.ui
			}]
		}];
		return r;
	}
	getJSON() {
		return JSON.stringify(this.getMeta());
	}
	getUI() {
		return this.getMeta().ui;
	}
};
var FaustScriptProcessorNode = class extends (globalThis.ScriptProcessorNode || null) {
	constructor() {
		super(...arguments);
		this.handleDeviceMotion = void 0;
		this.handleDeviceOrientation = void 0;
	}
	setupNode(instance) {
		this.fDSPCode = instance;
		this.fInputs = new Array(this.fDSPCode.getNumInputs());
		this.fOutputs = new Array(this.fDSPCode.getNumOutputs());
		this.handleDeviceMotion = ({ accelerationIncludingGravity }) => {
			const isAndroid = /Android/i.test(navigator.userAgent);
			if (!accelerationIncludingGravity) return;
			const { x, y, z } = accelerationIncludingGravity;
			this.propagateAcc({
				x,
				y,
				z
			}, isAndroid);
		};
		this.handleDeviceOrientation = ({ alpha, beta, gamma }) => {
			this.propagateGyr({
				alpha,
				beta,
				gamma
			});
		};
		this.onaudioprocess = (e) => {
			for (let chan = 0; chan < this.fDSPCode.getNumInputs(); chan++) this.fInputs[chan] = e.inputBuffer.getChannelData(chan);
			for (let chan = 0; chan < this.fDSPCode.getNumOutputs(); chan++) this.fOutputs[chan] = e.outputBuffer.getChannelData(chan);
			return this.fDSPCode.compute(this.fInputs, this.fOutputs);
		};
		this.start();
	}
	init() {
		this.fDSPCode.init();
	}
	instanceInit() {
		this.fDSPCode.instanceInit();
	}
	instanceClear() {
		this.fDSPCode.instanceClear();
	}
	instanceConstants() {
		this.fDSPCode.instanceConstants();
	}
	instanceResetUserInterface() {
		this.fDSPCode.instanceResetUserInterface();
	}
	/** Start accelerometer and gyroscope handlers */
	async startSensors() {
		if (this.hasAccInput) if (window.DeviceMotionEvent) window.addEventListener("devicemotion", this.handleDeviceMotion, true);
		else console.log("Cannot set the accelerometer handler.");
		if (this.hasGyrInput) if (window.DeviceMotionEvent) window.addEventListener("deviceorientation", this.handleDeviceOrientation, true);
		else console.log("Cannot set the gyroscope handler.");
	}
	/** Stop accelerometer and gyroscope handlers */
	stopSensors() {
		if (this.hasAccInput) window.removeEventListener("devicemotion", this.handleDeviceMotion, true);
		if (this.hasGyrInput) window.removeEventListener("deviceorientation", this.handleDeviceOrientation, true);
	}
	compute(input, output) {
		return this.fDSPCode.compute(input, output);
	}
	setOutputParamHandler(handler) {
		this.fDSPCode.setOutputParamHandler(handler);
	}
	getOutputParamHandler() {
		return this.fDSPCode.getOutputParamHandler();
	}
	callOutputParamHandler(path, value) {
		this.fDSPCode.callOutputParamHandler(path, value);
	}
	setInputParamHandler(handler) {
		this.fDSPCode.setInputParamHandler(handler);
	}
	getInputParamHandler() {
		return this.fDSPCode.getInputParamHandler();
	}
	callInputParamHandler(path, value) {
		this.fDSPCode.callInputParamHandler(path, value);
	}
	setComputeHandler(handler) {
		this.fDSPCode.setComputeHandler(handler);
	}
	getComputeHandler() {
		return this.fDSPCode.getComputeHandler();
	}
	setPlotHandler(handler) {
		this.fDSPCode.setPlotHandler(handler);
	}
	getPlotHandler() {
		return this.fDSPCode.getPlotHandler();
	}
	getNumInputs() {
		return this.fDSPCode.getNumInputs();
	}
	getNumOutputs() {
		return this.fDSPCode.getNumOutputs();
	}
	metadata(handler) {}
	midiMessage(data) {
		this.fDSPCode.midiMessage(data);
	}
	ctrlChange(chan, ctrl, value) {
		this.fDSPCode.ctrlChange(chan, ctrl, value);
	}
	pitchWheel(chan, value) {
		this.fDSPCode.pitchWheel(chan, value);
	}
	keyOn(channel, pitch, velocity) {
		this.fDSPCode.keyOn(channel, pitch, velocity);
	}
	keyOff(channel, pitch, velocity) {
		this.fDSPCode.keyOff(channel, pitch, velocity);
	}
	setParamValue(path, value) {
		this.fDSPCode.setParamValue(path, value);
	}
	getParamValue(path) {
		return this.fDSPCode.getParamValue(path);
	}
	getParams() {
		return this.fDSPCode.getParams();
	}
	getMeta() {
		return this.fDSPCode.getMeta();
	}
	getJSON() {
		return this.fDSPCode.getJSON();
	}
	getDescriptors() {
		return this.fDSPCode.getDescriptors();
	}
	getUI() {
		return this.fDSPCode.getUI();
	}
	start() {
		this.fDSPCode.start();
	}
	stop() {
		this.fDSPCode.stop();
	}
	destroy() {
		this.fDSPCode.destroy();
	}
	get hasAccInput() {
		return this.fDSPCode.hasAccInput;
	}
	propagateAcc(accelerationIncludingGravity, invert = false) {
		this.fDSPCode.propagateAcc(accelerationIncludingGravity, invert);
	}
	get hasGyrInput() {
		return this.fDSPCode.hasGyrInput;
	}
	propagateGyr(event) {
		this.fDSPCode.propagateGyr(event);
	}
};
var FaustMonoScriptProcessorNode = class extends FaustScriptProcessorNode {};
var FaustPolyScriptProcessorNode = class extends FaustScriptProcessorNode {
	keyOn(channel, pitch, velocity) {
		this.fDSPCode.keyOn(channel, pitch, velocity);
	}
	keyOff(channel, pitch, velocity) {
		this.fDSPCode.keyOff(channel, pitch, velocity);
	}
	allNotesOff(hard) {
		this.fDSPCode.allNotesOff(hard);
	}
};
var _FaustMonoDspGenerator = class _FaustMonoDspGenerator {
	constructor() {
		this.factory = null;
	}
	async compile(compiler, name, code, args) {
		this.factory = await compiler.createMonoDSPFactory(name, code, args);
		if (this.factory) {
			this.name = name;
			return this;
		} else return null;
	}
	addSoundfiles(soundfileMap) {
		if (!this.factory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		for (const id in soundfileMap) this.factory.soundfiles[id] = soundfileMap[id];
	}
	getSoundfileList() {
		if (!this.factory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		const meta = JSON.parse(this.factory.json);
		const map = SoundfileReader_default.findSoundfilesFromMeta(meta);
		if (!map) return [];
		return Object.keys(map);
	}
	async createNode(context, name = this.name, factory = this.factory, sp = false, bufferSize = 1024, processorName = (factory == null ? void 0 : factory.shaKey) || name, processorOptions = {}) {
		var _a, _b;
		if (!factory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		const meta = JSON.parse(factory.json);
		const sampleSize = meta.compile_options.match("-double") ? 8 : 4;
		factory.soundfiles = await SoundfileReader_default.loadSoundfiles(meta, factory.soundfiles || {}, context);
		if (sp) {
			const monoDsp = new FaustMonoWebAudioDsp(await FaustWasmInstantiator_default.createAsyncMonoDSPInstance(factory), context.sampleRate, sampleSize, bufferSize, factory.soundfiles);
			const sp2 = context.createScriptProcessor(bufferSize, monoDsp.getNumInputs(), monoDsp.getNumOutputs());
			Object.setPrototypeOf(sp2, FaustMonoScriptProcessorNode.prototype);
			sp2.setupNode(monoDsp);
			return sp2;
		} else {
			if (!_FaustMonoDspGenerator.gWorkletProcessors.has(context)) _FaustMonoDspGenerator.gWorkletProcessors.set(context, /* @__PURE__ */ new Set());
			if (!((_a = _FaustMonoDspGenerator.gWorkletProcessors.get(context)) == null ? void 0 : _a.has(processorName))) try {
				const processorCode = `
// DSP name and JSON string for DSP are generated
const faustData = ${JSON.stringify({
					processorName,
					dspName: name,
					dspMeta: meta,
					poly: false
				})};
// Implementation needed classes of functions
var ${FaustDspInstance.name} = ${FaustDspInstance.toString()}
var FaustDspInstance = ${FaustDspInstance.name};
var ${FaustBaseWebAudioDsp.name} = ${FaustBaseWebAudioDsp.toString()}
var FaustBaseWebAudioDsp = ${FaustBaseWebAudioDsp.name};
var ${FaustMonoWebAudioDsp.name} = ${FaustMonoWebAudioDsp.toString()}
var FaustMonoWebAudioDsp = ${FaustMonoWebAudioDsp.name};
var ${FaustWasmInstantiator_default.name} = ${FaustWasmInstantiator_default.toString()}
var FaustWasmInstantiator = ${FaustWasmInstantiator_default.name};
var ${Soundfile.name} = ${Soundfile.toString()}
var Soundfile = ${Soundfile.name};
var ${WasmAllocator.name} = ${WasmAllocator.toString()}
var WasmAllocator = ${WasmAllocator.name};
var ${FaustSensors.name} = ${FaustSensors.toString()}
var FaustSensors = ${FaustSensors.name};
var ${FaustAudioWorkletCommunicator.name} = ${FaustAudioWorkletCommunicator.toString()}
var FaustAudioWorkletCommunicator = ${FaustAudioWorkletCommunicator.name};
var ${FaustAudioWorkletProcessorCommunicator.name} = ${FaustAudioWorkletProcessorCommunicator.toString()}
var FaustAudioWorkletProcessorCommunicator = ${FaustAudioWorkletProcessorCommunicator.name};
// Put them in dependencies
const dependencies = {
    FaustBaseWebAudioDsp,
    FaustMonoWebAudioDsp,
    FaustWasmInstantiator,
    FaustAudioWorkletProcessorCommunicator
};
// Generate the actual AudioWorkletProcessor code
(${FaustAudioWorkletProcessor_default.toString()})(dependencies, faustData);
`;
				const url = URL.createObjectURL(new Blob([processorCode], { type: "text/javascript" }));
				await context.audioWorklet.addModule(url);
				(_b = _FaustMonoDspGenerator.gWorkletProcessors.get(context)) == null || _b.add(processorName);
			} catch (e) {
				throw e;
			}
			return new FaustMonoAudioWorkletNode(context, { processorOptions: {
				name: processorName,
				factory,
				sampleSize,
				...processorOptions
			} });
		}
	}
	async createFFTNode(context, fftUtils, name = this.name, factory = this.factory, fftOptions = {}, processorName = (factory == null ? void 0 : factory.shaKey) ? `${factory.shaKey}_fft` : name, processorOptions = {}) {
		var _a, _b;
		if (!factory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		const meta = JSON.parse(factory.json);
		const sampleSize = meta.compile_options.match("-double") ? 8 : 4;
		factory.soundfiles = await SoundfileReader_default.loadSoundfiles(meta, factory.soundfiles || {}, context);
		if (!_FaustMonoDspGenerator.gWorkletProcessors.has(context)) _FaustMonoDspGenerator.gWorkletProcessors.set(context, /* @__PURE__ */ new Set());
		if (!((_a = _FaustMonoDspGenerator.gWorkletProcessors.get(context)) == null ? void 0 : _a.has(processorName))) try {
			const processorCode = `
// DSP name and JSON string for DSP are generated
const faustData = ${JSON.stringify({
				processorName,
				dspName: name,
				dspMeta: meta,
				fftOptions
			})};
// Implementation needed classes of functions
var ${FaustDspInstance.name} = ${FaustDspInstance.toString()}
var FaustDspInstance = ${FaustDspInstance.name};
var ${FaustBaseWebAudioDsp.name} = ${FaustBaseWebAudioDsp.toString()}
var FaustBaseWebAudioDsp = ${FaustBaseWebAudioDsp.name};
var ${FaustMonoWebAudioDsp.name} = ${FaustMonoWebAudioDsp.toString()}
var FaustMonoWebAudioDsp = ${FaustMonoWebAudioDsp.name};
var ${FaustWasmInstantiator_default.name} = ${FaustWasmInstantiator_default.toString()}
var FaustWasmInstantiator = ${FaustWasmInstantiator_default.name};
var ${Soundfile.name} = ${Soundfile.toString()}
var Soundfile = ${Soundfile.name};
var ${WasmAllocator.name} = ${WasmAllocator.toString()}
var WasmAllocator = ${WasmAllocator.name};
var ${FaustSensors.name} = ${FaustSensors.toString()}
var FaustSensors = ${FaustSensors.name};
var ${FaustAudioWorkletCommunicator.name} = ${FaustAudioWorkletCommunicator.toString()}
var FaustAudioWorkletCommunicator = ${FaustAudioWorkletCommunicator.name};
var ${FaustAudioWorkletProcessorCommunicator.name} = ${FaustAudioWorkletProcessorCommunicator.toString()}
var FaustAudioWorkletProcessorCommunicator = ${FaustAudioWorkletProcessorCommunicator.name};
var FFTUtils = ${fftUtils.toString()}
// Put them in dependencies
const dependencies = {
    FaustBaseWebAudioDsp,
    FaustMonoWebAudioDsp,
    FaustWasmInstantiator,
    FaustAudioWorkletProcessorCommunicator,
    FFTUtils
};
// Generate the actual AudioWorkletProcessor code
(${FaustFFTAudioWorkletProcessor_default.toString()})(dependencies, faustData);
`;
			const url = URL.createObjectURL(new Blob([processorCode], { type: "text/javascript" }));
			await context.audioWorklet.addModule(url);
			(_b = _FaustMonoDspGenerator.gWorkletProcessors.get(context)) == null || _b.add(processorName);
		} catch (e) {
			throw e;
		}
		const node = new FaustMonoAudioWorkletNode(context, {
			channelCount: Math.max(1, Math.ceil(meta.inputs / 3)),
			outputChannelCount: [Math.ceil(meta.outputs / 2)],
			processorOptions: {
				name: processorName,
				factory,
				sampleSize,
				...processorOptions
			}
		});
		if (fftOptions.fftSize) {
			const param = node.parameters.get("fftSize");
			if (param) param.value = fftOptions.fftSize;
		}
		if (fftOptions.fftOverlap) {
			const param = node.parameters.get("fftOverlap");
			if (param) param.value = fftOptions.fftOverlap;
		}
		if (typeof fftOptions.defaultWindowFunction === "number") {
			const param = node.parameters.get("windowFunction");
			if (param) param.value = fftOptions.defaultWindowFunction + 1;
		}
		if (typeof fftOptions.noIFFT === "boolean") {
			const param = node.parameters.get("noIFFT");
			if (param) param.value = +fftOptions.noIFFT;
		}
		return node;
	}
	async createAudioWorkletProcessor(name = this.name, factory = this.factory, processorName = (factory == null ? void 0 : factory.shaKey) || name) {
		if (!factory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		const meta = JSON.parse(factory.json);
		const dependencies = {
			FaustBaseWebAudioDsp,
			FaustMonoWebAudioDsp,
			FaustWasmInstantiator: FaustWasmInstantiator_default,
			FaustAudioWorkletProcessorCommunicator,
			FaustPolyWebAudioDsp: void 0,
			FaustWebAudioDspVoice: void 0
		};
		try {
			return FaustAudioWorkletProcessor_default(dependencies, {
				processorName,
				dspName: name,
				dspMeta: meta,
				poly: false
			});
		} catch (e) {
			throw e;
		}
	}
	async createOfflineProcessor(sampleRate, bufferSize, factory = this.factory, context) {
		if (!factory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		const meta = JSON.parse(factory.json);
		const instance = await FaustWasmInstantiator_default.createAsyncMonoDSPInstance(factory);
		const sampleSize = meta.compile_options.match("-double") ? 8 : 4;
		if (context) factory.soundfiles = await SoundfileReader_default.loadSoundfiles(meta, factory.soundfiles || {}, context);
		return new FaustMonoOfflineProcessor(new FaustMonoWebAudioDsp(instance, sampleRate, sampleSize, bufferSize, factory.soundfiles), bufferSize);
	}
	getMeta() {
		return JSON.parse(this.factory.json);
	}
	getJSON() {
		return JSON.stringify(this.getMeta());
	}
	getUI() {
		return this.getMeta().ui;
	}
};
_FaustMonoDspGenerator.gWorkletProcessors = /* @__PURE__ */ new Map();
var FaustMonoDspGenerator = _FaustMonoDspGenerator;
var _FaustPolyDspGenerator = class _FaustPolyDspGenerator {
	constructor() {
		this.voiceFactory = null;
		this.effectFactory = null;
	}
	async compile(compiler, name, dspCodeAux, args, effectCodeAux = `dsp_code = environment{
                ${dspCodeAux}
            };
            process = dsp_code.effect;`) {
		try {
			this.effectFactory = await compiler.createPolyDSPFactory(name, effectCodeAux, args);
			if (this.effectFactory) {
				const effectJSON = JSON.parse(this.effectFactory.json);
				const dspCode = `// Voice output is forced to 2, when DSP is stereo or effect has 2 ins or 2 outs,
// so that the effect can process the 2 channels of the voice
adaptOut(1,1,1) = _;
adaptOut(1,1,2) = _ <: _,0;  // The left channel only is kept
adaptOut(1,2,1) = _ <: _,_;
adaptOut(1,2,2) = _ <: _,_;
adaptOut(2,1,1) = _,_;
adaptOut(2,1,2) = _,_;
adaptOut(2,2,1) = _,_;
adaptOut(2,2,2) = _,_;
adaptor(F) = adaptOut(outputs(F),${effectJSON.inputs},${effectJSON.outputs});
dsp_code = environment{
    ${dspCodeAux}
};
process = dsp_code.process : adaptor(dsp_code.process);
`;
				const effectCode = `// Inputs
adaptIn(1,1,1) = _;
adaptIn(1,1,2) = _,_ :> _;  
adaptIn(1,2,1) = _,_;
adaptIn(1,2,2) = _,_;
adaptIn(2,1,1) = _,_ :> _;
adaptIn(2,1,2) = _,_ :> _;
adaptIn(2,2,1) = _,_;
adaptIn(2,2,2) = _,_;
// Outputs
adaptOut(1,1) = _ <: _,0;   // The left channel only is kept
adaptOut(1,2) = _,_;
adaptOut(2,1) = _ <: _,0;   // The left channel only is kept
adaptOut(2,2) = _,_;
adaptorIns(F) = adaptIn(outputs(F),${effectJSON.inputs},${effectJSON.outputs});
adaptorOuts = adaptOut(${effectJSON.inputs},${effectJSON.outputs});
dsp_code = environment{
    ${dspCodeAux}
};
process = adaptorIns(dsp_code.process) : dsp_code.effect : adaptorOuts;
`;
				this.voiceFactory = await compiler.createPolyDSPFactory(name, dspCode, args);
				try {
					this.effectFactory = await compiler.createPolyDSPFactory(name, effectCode, args + " -inpl");
				} catch (e) {
					console.warn(e);
				}
			}
		} catch (e) {
			if (!(e instanceof Error ? e.message : String(e != null ? e : "unknown error")).includes("undefined symbol : effect")) console.warn(e);
			this.voiceFactory = await compiler.createPolyDSPFactory(name, dspCodeAux, args);
		}
		if (this.voiceFactory) {
			this.name = name;
			const isDouble = JSON.parse(this.voiceFactory.json).compile_options.match("-double");
			const { mixerBuffer, mixerModule } = await compiler.getAsyncInternalMixerModule(!!isDouble);
			this.mixerBuffer = mixerBuffer;
			this.mixerModule = mixerModule;
			return this;
		} else return null;
	}
	addSoundfiles(soundfileMap) {
		if (!this.voiceFactory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		for (const id in soundfileMap) this.voiceFactory.soundfiles[id] = soundfileMap[id];
	}
	getSoundfileList() {
		if (!this.voiceFactory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		const meta = JSON.parse(this.voiceFactory.json);
		const map = SoundfileReader_default.findSoundfilesFromMeta(meta);
		if (!map) return [];
		if (!this.effectFactory) return Object.keys(map);
		const effectMeta = JSON.parse(this.effectFactory.json);
		const effectMap = SoundfileReader_default.findSoundfilesFromMeta(effectMeta);
		return Object.keys({
			...effectMap,
			...map
		});
	}
	async createNode(context, voices, name = this.name, voiceFactory = this.voiceFactory, mixerModule = this.mixerModule, effectFactory = this.effectFactory, sp = false, bufferSize = 1024, processorName = ((voiceFactory == null ? void 0 : voiceFactory.shaKey) || "") + ((effectFactory == null ? void 0 : effectFactory.shaKey) || "") || `${name}_poly`, processorOptions = {}) {
		var _a, _b;
		if (!voiceFactory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		const voiceMeta = JSON.parse(voiceFactory.json);
		const effectMeta = effectFactory ? JSON.parse(effectFactory.json) : void 0;
		const sampleSize = voiceMeta.compile_options.match("-double") ? 8 : 4;
		voiceFactory.soundfiles = await SoundfileReader_default.loadSoundfiles(voiceMeta, voiceFactory.soundfiles || {}, context);
		if (effectFactory) effectFactory.soundfiles = await SoundfileReader_default.loadSoundfiles(effectMeta, effectFactory.soundfiles || {}, context);
		if (sp) {
			const instance = await FaustWasmInstantiator_default.createAsyncPolyDSPInstance(voiceFactory, mixerModule, voices, effectFactory || void 0);
			const soundfiles = {
				...effectFactory == null ? void 0 : effectFactory.soundfiles,
				...voiceFactory.soundfiles
			};
			const polyDsp = new FaustPolyWebAudioDsp(instance, context.sampleRate, sampleSize, bufferSize, soundfiles);
			const sp2 = context.createScriptProcessor(bufferSize, polyDsp.getNumInputs(), polyDsp.getNumOutputs());
			Object.setPrototypeOf(sp2, FaustPolyScriptProcessorNode.prototype);
			sp2.setupNode(polyDsp);
			return sp2;
		} else {
			if (!_FaustPolyDspGenerator.gWorkletProcessors.has(context)) _FaustPolyDspGenerator.gWorkletProcessors.set(context, /* @__PURE__ */ new Set());
			if (!((_a = _FaustPolyDspGenerator.gWorkletProcessors.get(context)) == null ? void 0 : _a.has(processorName))) try {
				const processorCode = `
// DSP name and JSON string for DSP are generated
const faustData = ${JSON.stringify({
					processorName,
					dspName: name,
					dspMeta: voiceMeta,
					poly: true,
					effectMeta
				})};
// Implementation needed classes of functions
var ${FaustDspInstance.name} = ${FaustDspInstance.toString()}
var FaustDspInstance = ${FaustDspInstance.name};
var ${FaustBaseWebAudioDsp.name} = ${FaustBaseWebAudioDsp.toString()}
var FaustBaseWebAudioDsp = ${FaustBaseWebAudioDsp.name};
var ${FaustPolyWebAudioDsp.name} = ${FaustPolyWebAudioDsp.toString()}
var FaustPolyWebAudioDsp = ${FaustPolyWebAudioDsp.name};
var ${FaustWebAudioDspVoice.name} = ${FaustWebAudioDspVoice.toString()}
var FaustWebAudioDspVoice = ${FaustWebAudioDspVoice.name};
var ${FaustWasmInstantiator_default.name} = ${FaustWasmInstantiator_default.toString()}
var FaustWasmInstantiator = ${FaustWasmInstantiator_default.name};
var ${Soundfile.name} = ${Soundfile.toString()}
var Soundfile = ${Soundfile.name};
var ${WasmAllocator.name} = ${WasmAllocator.toString()}
var WasmAllocator = ${WasmAllocator.name};
var ${FaustSensors.name} = ${FaustSensors.toString()}
var FaustSensors = ${FaustSensors.name};
var ${FaustAudioWorkletCommunicator.name} = ${FaustAudioWorkletCommunicator.toString()}
var FaustAudioWorkletCommunicator = ${FaustAudioWorkletCommunicator.name};
var ${FaustAudioWorkletProcessorCommunicator.name} = ${FaustAudioWorkletProcessorCommunicator.toString()}
var FaustAudioWorkletProcessorCommunicator = ${FaustAudioWorkletProcessorCommunicator.name};
// Put them in dependencies
const dependencies = {
    FaustBaseWebAudioDsp,
    FaustPolyWebAudioDsp,
    FaustWasmInstantiator,
    FaustAudioWorkletProcessorCommunicator
};
// Generate the actual AudioWorkletProcessor code
(${FaustAudioWorkletProcessor_default.toString()})(dependencies, faustData);
`;
				const url = URL.createObjectURL(new Blob([processorCode], { type: "text/javascript" }));
				await context.audioWorklet.addModule(url);
				(_b = _FaustPolyDspGenerator.gWorkletProcessors.get(context)) == null || _b.add(processorName);
			} catch (e) {
				throw e;
			}
			return new FaustPolyAudioWorkletNode(context, { processorOptions: {
				name: processorName,
				voiceFactory,
				mixerModule,
				voices,
				sampleSize,
				effectFactory: effectFactory || void 0,
				...processorOptions
			} });
		}
	}
	async createAudioWorkletProcessor(name = this.name, voiceFactory = this.voiceFactory, effectFactory = this.effectFactory, processorName = ((voiceFactory == null ? void 0 : voiceFactory.shaKey) || "") + ((effectFactory == null ? void 0 : effectFactory.shaKey) || "") || `${name}_poly`) {
		if (!voiceFactory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		const voiceMeta = JSON.parse(voiceFactory.json);
		const effectMeta = effectFactory ? JSON.parse(effectFactory.json) : void 0;
		voiceMeta.compile_options.match("-double");
		try {
			return FaustAudioWorkletProcessor_default({
				FaustBaseWebAudioDsp,
				FaustMonoWebAudioDsp: void 0,
				FaustWasmInstantiator: FaustWasmInstantiator_default,
				FaustPolyWebAudioDsp,
				FaustWebAudioDspVoice,
				FaustAudioWorkletProcessorCommunicator
			}, {
				processorName,
				dspName: name,
				dspMeta: voiceMeta,
				poly: true,
				effectMeta
			});
		} catch (e) {
			throw e;
		}
	}
	async createOfflineProcessor(sampleRate, bufferSize, voices, voiceFactory = this.voiceFactory, mixerModule = this.mixerModule, effectFactory = this.effectFactory, context) {
		if (!voiceFactory) throw new Error("Code is not compiled, please define the factory or call `await this.compile()` first.");
		const voiceMeta = JSON.parse(voiceFactory.json);
		const effectMeta = effectFactory ? JSON.parse(effectFactory.json) : void 0;
		const instance = await FaustWasmInstantiator_default.createAsyncPolyDSPInstance(voiceFactory, mixerModule, voices, effectFactory || void 0);
		const sampleSize = voiceMeta.compile_options.match("-double") ? 8 : 4;
		if (context) {
			voiceFactory.soundfiles = await SoundfileReader_default.loadSoundfiles(voiceMeta, voiceFactory.soundfiles || {}, context);
			if (effectFactory) effectFactory.soundfiles = await SoundfileReader_default.loadSoundfiles(effectMeta, effectFactory.soundfiles || {}, context);
		}
		return new FaustPolyOfflineProcessor(new FaustPolyWebAudioDsp(instance, sampleRate, sampleSize, bufferSize, {
			...effectFactory == null ? void 0 : effectFactory.soundfiles,
			...voiceFactory.soundfiles
		}), bufferSize);
	}
	getMeta() {
		const o = this.voiceFactory ? JSON.parse(this.voiceFactory.json) : null;
		const e = this.effectFactory ? JSON.parse(this.effectFactory.json) : null;
		const r = { ...o };
		if (e) r.ui = [{
			type: "tgroup",
			label: "Sequencer",
			items: [{
				type: "vgroup",
				label: "Instrument",
				items: o.ui
			}, {
				type: "vgroup",
				label: "Effect",
				items: e.ui
			}]
		}];
		else r.ui = [{
			type: "tgroup",
			label: "Polyphonic",
			items: [{
				type: "vgroup",
				label: "Voices",
				items: o.ui
			}]
		}];
		return r;
	}
	getJSON() {
		return JSON.stringify(this.getMeta());
	}
	getUI() {
		return this.getMeta().ui;
	}
};
_FaustPolyDspGenerator.gWorkletProcessors = /* @__PURE__ */ new Map();
var FaustPolyDspGenerator = _FaustPolyDspGenerator;
var _FaustDspGenerator = class _FaustDspGenerator {
	extractMidiAndNvoices(jsonData) {
		const optionsMetadata = jsonData.meta.find((meta) => meta.options);
		if (optionsMetadata && optionsMetadata.options) {
			const options = optionsMetadata.options;
			const midiRegex = /\[midi:(on|off)\]/;
			const nvoicesRegex = /\[nvoices:(\d+)\]/;
			const midiMatch = options.match(midiRegex);
			const nvoicesMatch = options.match(nvoicesRegex);
			return {
				midi: midiMatch ? midiMatch[1] === "on" : false,
				nvoices: nvoicesMatch ? parseInt(nvoicesMatch[1], 10) : -1
			};
		} else return {
			midi: false,
			nvoices: -1
		};
	}
	/**
	* Compile DSP code, inspect metadata for [nvoices:] (and optionally [midi:on]), and build either a mono
	* or poly WebAudio node (ScriptProcessor or AudioWorklet depending on `sp`). Compilation uses a shared,
	* lazily-created libfaust instance to avoid repeatedly instantiating the WASM compiler.
	*/
	async createFaustNode(context, name, code, sp, bufferSize) {
		const getCompiler = async () => {
			if (!_FaustDspGenerator.compilerPromise) {
				const baseURL = (typeof document !== "undefined" ? "src" in (document.currentScript || {}) ? document.currentScript.src : document.baseURI : void 0) || (typeof window !== "undefined" ? window.location.href : void 0);
				if (!baseURL) throw new Error("Cannot resolve libfaust-wasm location.");
				const jsURL = new URL("../libfaust-wasm/libfaust-wasm.js", baseURL).href;
				_FaustDspGenerator.compilerPromise = instantiateFaustModuleFromFile_default(jsURL, jsURL.replace(/c?js$/, "data"), jsURL.replace(/c?js$/, "wasm")).then((module) => new FaustCompiler_default(new LibFaust_default(module)));
			}
			return _FaustDspGenerator.compilerPromise;
		};
		const args = "-ftz 2";
		try {
			const compiler = await getCompiler();
			const monoGenerator = new FaustMonoDspGenerator();
			if (!await monoGenerator.compile(compiler, name, code, args)) return null;
			const { nvoices } = this.extractMidiAndNvoices(monoGenerator.getMeta());
			if (nvoices > 0) {
				const polyGenerator = new FaustPolyDspGenerator();
				if (!await polyGenerator.compile(compiler, name, code, args)) return null;
				return await polyGenerator.createNode(context, nvoices, name, void 0, void 0, void 0, sp, bufferSize);
			}
			return await monoGenerator.createNode(context, name, void 0, sp, bufferSize);
		} catch (e) {
			console.error(e);
			return null;
		}
	}
};
_FaustDspGenerator.compilerPromise = null;
//#endregion
//#region src/audio/math.js
/**
* @param {number} midiNote
* @returns {number}
*/
function mtof(midiNote) {
	return 440 * Math.pow(2, (midiNote - 69) / 12);
}
/**
* @param {number} pos
* @param {number} min
* @param {number} max
* @param {string} scale
* @returns {number}
*/
function normalizedToValue(pos, min, max, scale) {
	if (scale === "log") return min * Math.pow(max / min, pos);
	if (scale === "log-reverse") return max + min - min * Math.pow(max / min, 1 - pos);
	if (scale === "fine-center") {
		const center = (max + min) / 2;
		const range = (max - min) / 2;
		const t = (pos - .5) * 2;
		return center + Math.sign(t) * t * t * range;
	}
	return min + (max - min) * pos;
}
/**
* @param {number} val
* @param {number} min
* @param {number} max
* @param {string} scale
* @returns {number}
*/
function valueToNormalized(val, min, max, scale) {
	if (scale === "log") return Math.log(val / min) / Math.log(max / min);
	if (scale === "log-reverse") return 1 - Math.log((max + min - val) / min) / Math.log(max / min);
	if (scale === "fine-center") {
		const center = (max + min) / 2;
		const range = (max - min) / 2;
		const delta = val - center;
		return Math.sign(delta) * Math.sqrt(Math.abs(delta) / range) / 2 + .5;
	}
	return (val - min) / (max - min);
}
/**
* Detect a musical interval from a cent value, latching at m3 (±300¢),
* M3 (±400¢), and P5 (±700¢) within a ±15¢ tolerance window. Symmetric
* about zero. The P5 upper window is clipped at the slider maximum
* (685–700¢ rather than 685–715¢) — see osc-freq-range-intervals design D4.
* @param {number} cents
* @returns {"m3" | "M3" | "P5" | null}
*/
function detectInterval(cents) {
	const abs = Math.abs(cents);
	if (abs >= 285 && abs <= 315) return "m3";
	if (abs >= 385 && abs <= 415) return "M3";
	if (abs >= 685 && abs <= 700) return "P5";
	return null;
}
/**
* @param {number} val
* @param {string} unit
* @returns {string}
*/
function formatValue(val, unit) {
	if (unit === "Hz") {
		if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(1)} kHz`;
		if (Math.abs(val) < 10) return `${val.toFixed(2)} Hz`;
		return `${Math.round(val)} Hz`;
	}
	if (unit === "s") return val < 1 ? `${Math.round(val * 1e3)} ms` : `${val.toFixed(2)} s`;
	if (unit === "st") return `${(val / 100).toFixed(2)} st`;
	return val.toFixed(2);
}
//#endregion
//#region src/audio/keyboard.js
var BASE_MIDI = 48;
/** @type {Record<string, number>} */
var QWERTY_MAP = {
	z: BASE_MIDI + 0,
	s: BASE_MIDI + 1,
	x: BASE_MIDI + 2,
	d: BASE_MIDI + 3,
	c: BASE_MIDI + 4,
	v: BASE_MIDI + 5,
	g: BASE_MIDI + 6,
	b: BASE_MIDI + 7,
	h: BASE_MIDI + 8,
	n: BASE_MIDI + 9,
	j: BASE_MIDI + 10,
	m: BASE_MIDI + 11,
	q: BASE_MIDI + 12,
	2: BASE_MIDI + 13,
	w: BASE_MIDI + 14,
	3: BASE_MIDI + 15,
	e: BASE_MIDI + 16,
	r: BASE_MIDI + 17,
	5: BASE_MIDI + 18,
	t: BASE_MIDI + 19,
	6: BASE_MIDI + 20,
	y: BASE_MIDI + 21,
	7: BASE_MIDI + 22,
	u: BASE_MIDI + 23,
	i: BASE_MIDI + 24
};
/**
* Returns the ordered parameter messages to send to the DSP engine for a note-on.
* When already active, only freq is updated to avoid an amplitude discontinuity click.
* @param {number} freq
* @param {boolean} currentlyActive
* @returns {Array<{ param: string, value: number }>}
*/
function buildNoteOnMessages(freq, currentlyActive) {
	if (currentlyActive) return [{
		param: "freq",
		value: freq
	}];
	return [{
		param: "freq",
		value: freq
	}, {
		param: "gate",
		value: 1
	}];
}
/**
* Converts a MIDI note number to Hz, applying an octave transpose offset.
* @param {number} midiNote
* @param {number} [octaveOffset]
* @returns {number}
*/
function midiToFreq(midiNote, octaveOffset = 0) {
	return mtof(midiNote + octaveOffset * 12);
}
//#endregion
//#region src/audio/engine.js
var PARAM_PREFIX = "/synth/";
/** @type {AudioContext | null} */
var ctx = null;
/** @type {any} */
var node = null;
/** @type {AnalyserNode | null} */
var analyserNode = null;
var mixerPeakValue = 0;
var outputPeakValue = 0;
async function powerOn() {
	ctx = new AudioContext({ sampleRate: 48e3 });
	analyserNode = ctx.createAnalyser();
	analyserNode.fftSize = 2048;
	if (typeof window !== "undefined") window.__audioCtx = ctx;
	await ctx.resume();
	const base = "./";
	const dspMeta = await (await fetch(`${base}dsp-meta.json`)).json();
	const dspModule = await WebAssembly.compileStreaming(await fetch(`${base}dsp-module.wasm`));
	node = await new FaustMonoDspGenerator().createNode(ctx, "synth", {
		module: dspModule,
		json: JSON.stringify(dspMeta),
		soundfiles: {}
	});
	if (!node) throw new Error("Faust node creation failed");
	node.setOutputParamHandler((path, value) => {
		if (path === PARAM_PREFIX + "mixerPeak") mixerPeakValue = value;
		if (path === PARAM_PREFIX + "outputPeak") outputPeakValue = value;
	});
	node.connect(analyserNode);
	analyserNode.connect(ctx.destination);
}
async function powerOff() {
	if (!ctx) return;
	mixerPeakValue = 0;
	outputPeakValue = 0;
	if (node) {
		node.disconnect();
		node = null;
	}
	await ctx.close();
	ctx = null;
	analyserNode = null;
}
/**
* @param {string} name
* @param {number} value
*/
function setParam(name, value) {
	if (!node) return;
	if (!Number.isFinite(value)) return;
	node.setParamValue(PARAM_PREFIX + name, value);
}
function getAnalyser() {
	return analyserNode;
}
function getMixerPeak() {
	return mixerPeakValue;
}
function getOutputPeak() {
	return outputPeakValue;
}
//#endregion
//#region src/audio/midi.js
var BEND_SEMITONES = 2;
var BEND_CENTER = 8192;
var MidiManager = class {
	/** @type {MIDIAccess | null} */
	#access = null;
	/** @type {string | null} */
	#selectedId = null;
	/** @type {Set<number>} */
	#activeNotes = /* @__PURE__ */ new Set();
	#bendValue = 0;
	/** @type {number | null} */
	#lastNote = null;
	/** @param {{ onNoteOn?: Function, onNoteOff?: Function, onPitchBend?: Function, onCc?: Function, onStatusChange?: Function, onDevicesChange?: Function }} callbacks */
	constructor(callbacks = {}) {
		this._onNoteOn = callbacks.onNoteOn ?? (() => {});
		this._onNoteOff = callbacks.onNoteOff ?? (() => {});
		this._onPitchBend = callbacks.onPitchBend ?? (() => {});
		this._onCc = callbacks.onCc ?? (() => {});
		this._onStatusChange = callbacks.onStatusChange ?? (() => {});
		this._onDevicesChange = callbacks.onDevicesChange ?? (() => {});
		this._handleMessage = this._handleMessage.bind(this);
		this._handleStateChange = this._handleStateChange.bind(this);
	}
	async connect() {
		if (!navigator.requestMIDIAccess) {
			this._onStatusChange("unavailable");
			return;
		}
		try {
			this.#access = await navigator.requestMIDIAccess({ sysex: false });
		} catch {
			this._onStatusChange("unavailable");
			return;
		}
		this.#access.onstatechange = this._handleStateChange;
		this._attachListeners();
		this._onStatusChange("connected");
		this._notifyDevices();
	}
	/** @param {string} id */
	selectDevice(id) {
		this._detachListeners();
		this.#selectedId = id;
		this._attachListeners();
	}
	destroy() {
		this._detachListeners();
		if (this.#access) {
			this.#access.onstatechange = null;
			this.#access = null;
		}
	}
	_devices() {
		if (!this.#access) return [];
		return Array.from(this.#access.inputs.values()).map((p) => ({
			id: p.id,
			name: p.name
		}));
	}
	_notifyDevices() {
		const devices = this._devices();
		this._onDevicesChange(devices);
		if (devices.length > 0 && !this.#selectedId) this.#selectedId = devices[0].id;
	}
	_attachListeners() {
		if (!this.#access) return;
		for (const port of this.#access.inputs.values()) if (this.#selectedId === null || port.id === this.#selectedId) port.onmidimessage = this._handleMessage;
	}
	_detachListeners() {
		if (!this.#access) return;
		for (const port of this.#access.inputs.values()) port.onmidimessage = null;
	}
	/** @param {MIDIConnectionEvent} event */
	_handleStateChange(event) {
		const port = event.port;
		if (!port || port.type !== "input") return;
		const inputPort = port;
		if (inputPort.state === "disconnected") {
			inputPort.onmidimessage = null;
			if (inputPort.id === this.#selectedId) {
				this.#selectedId = null;
				this._releaseAllNotes();
			}
		} else if (inputPort.state === "connected") {
			if (this.#selectedId === null || inputPort.id === this.#selectedId) {
				inputPort.onmidimessage = this._handleMessage;
				if (this.#selectedId === null) this.#selectedId = inputPort.id;
			}
		}
		this._notifyDevices();
	}
	_releaseAllNotes() {
		for (const note of this.#activeNotes) this._onNoteOff(note);
		this.#activeNotes.clear();
	}
	/** @param {MIDIMessageEvent} event */
	_handleMessage(event) {
		if (!event.data) return;
		const data = Array.from(event.data);
		const status = data[0];
		const data1 = data[1];
		const data2 = data[2];
		const type = status & 240;
		if (type === 144) if (data2 === 0) this._noteOff(data1);
		else this._noteOn(data1);
		else if (type === 128) this._noteOff(data1);
		else if (type === 224) {
			const raw = data2 << 7 | data1;
			this._pitchBend(raw);
		} else if (type === 176) this._onCc({
			cc: data1,
			value: data2
		});
	}
	/** @param {number} note */
	_noteOn(note) {
		this.#activeNotes.add(note);
		this.#lastNote = note;
		const freq = this._bentFreq(note);
		this._onNoteOn(note, freq);
	}
	/** @param {number} note */
	_noteOff(note) {
		if (!this.#activeNotes.has(note)) return;
		this.#activeNotes.delete(note);
		this._onNoteOff(note);
	}
	/** @param {number} raw */
	_pitchBend(raw) {
		const normalized = (raw - BEND_CENTER) / BEND_CENTER;
		this.#bendValue = normalized * BEND_SEMITONES;
		if (this.#lastNote !== null && this.#activeNotes.has(this.#lastNote)) this._onPitchBend(this._bentFreq(this.#lastNote));
	}
	/** @param {number} note */
	_bentFreq(note) {
		return midiToFreq(note) * Math.pow(2, this.#bendValue / 12);
	}
};
//#endregion
//#region src/audio/midiCcMap.js
var STORAGE_PREFIX = "midiCc:";
var PARAM_RENAMES = { reverbMix: "reverbSend" };
var MidiCcMap = class {
	/** @type {Map<number, { param: string, min: number, max: number }>} */
	#byCC = /* @__PURE__ */ new Map();
	/** @type {Map<string, number>} */
	#byParam = /* @__PURE__ */ new Map();
	constructor() {
		this.#load();
	}
	/** @param {number} cc @param {string} param @param {number} min @param {number} max */
	assign(cc, param, min, max) {
		const oldCc = this.#byParam.get(param);
		if (oldCc !== void 0) {
			this.#byCC.delete(oldCc);
			try {
				localStorage.removeItem(STORAGE_PREFIX + oldCc);
			} catch {}
		}
		this.#byCC.set(cc, {
			param,
			min,
			max
		});
		this.#byParam.set(param, cc);
		try {
			localStorage.setItem(STORAGE_PREFIX + cc, JSON.stringify({
				param,
				min,
				max
			}));
		} catch {}
	}
	/** @param {number} cc @returns {{ param: string, min: number, max: number } | null} */
	resolve(cc) {
		return this.#byCC.get(cc) ?? null;
	}
	/** @param {string} param @returns {number | null} */
	getAssignedCc(param) {
		return this.#byParam.get(param) ?? null;
	}
	/** @param {number} cc @param {number} raw 0–127 */
	scale(cc, raw) {
		const mapping = this.#byCC.get(cc);
		if (!mapping) return null;
		return mapping.min + (mapping.max - mapping.min) * (raw / 127);
	}
	#load() {
		try {
			/** @type {Array<{ cc: number, param: string, min: number, max: number }>} */
			const entries = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (!key?.startsWith(STORAGE_PREFIX)) continue;
				const cc = Number(key.slice(7));
				if (isNaN(cc)) continue;
				const raw = localStorage.getItem(key);
				if (!raw) continue;
				const { param, min, max } = JSON.parse(raw);
				entries.push({
					cc,
					param,
					min,
					max
				});
			}
			for (const { cc, param, min, max } of entries) {
				if (PARAM_RENAMES[param] !== void 0) continue;
				this.#byCC.set(cc, {
					param,
					min,
					max
				});
				this.#byParam.set(param, cc);
			}
			for (const { cc, param, min, max } of entries) {
				const target = PARAM_RENAMES[param];
				if (target === void 0) continue;
				if (this.#byParam.has(target)) continue;
				this.#byCC.set(cc, {
					param: target,
					min,
					max
				});
				this.#byParam.set(target, cc);
			}
		} catch {}
	}
};
//#endregion
//#region node_modules/svelte/src/reactivity/set.js
/** @import { Source } from '#client' */
var read_methods = [
	"forEach",
	"isDisjointFrom",
	"isSubsetOf",
	"isSupersetOf"
];
var set_like_methods = [
	"difference",
	"intersection",
	"symmetricDifference",
	"union"
];
var inited = false;
/**
* A reactive version of the built-in [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) object.
* Reading contents of the set (by iterating, or by reading `set.size` or calling `set.has(...)` as in the [example](https://svelte.dev/playground/53438b51194b4882bcc18cddf9f96f15) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
* will cause it to be re-evaluated as necessary when the set is updated.
*
* Note that values in a reactive set are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
*
* ```svelte
* <script>
* 	import { SvelteSet } from 'svelte/reactivity';
* 	let monkeys = new SvelteSet();
*
* 	function toggle(monkey) {
* 		if (monkeys.has(monkey)) {
* 			monkeys.delete(monkey);
* 		} else {
* 			monkeys.add(monkey);
* 		}
* 	}
* <\/script>
*
* {#each ['🙈', '🙉', '🙊'] as monkey}
* 	<button onclick={() => toggle(monkey)}>{monkey}</button>
* {/each}
*
* <button onclick={() => monkeys.clear()}>clear</button>
*
* {#if monkeys.has('🙈')}<p>see no evil</p>{/if}
* {#if monkeys.has('🙉')}<p>hear no evil</p>{/if}
* {#if monkeys.has('🙊')}<p>speak no evil</p>{/if}
* ```
*
* @template T
* @extends {Set<T>}
*/
var SvelteSet = class SvelteSet extends Set {
	/** @type {Map<T, Source<boolean>>} */
	#sources = /* @__PURE__ */ new Map();
	#version = /* @__PURE__ */ state(0);
	#size = /* @__PURE__ */ state(0);
	#update_version = update_version || -1;
	/**
	* @param {Iterable<T> | null | undefined} [value]
	*/
	constructor(value) {
		super();
		if (dev_fallback_default) {
			value = new Set(value);
			tag(this.#version, "SvelteSet version");
			tag(this.#size, "SvelteSet.size");
		}
		if (value) {
			for (var element of value) super.add(element);
			this.#size.v = super.size;
		}
		if (!inited) this.#init();
	}
	/**
	* If the source is being created inside the same reaction as the SvelteSet instance,
	* we use `state` so that it will not be a dependency of the reaction. Otherwise we
	* use `source` so it will be.
	*
	* @template T
	* @param {T} value
	* @returns {Source<T>}
	*/
	#source(value) {
		return update_version === this.#update_version ? /* @__PURE__ */ state(value) : source(value);
	}
	#init() {
		inited = true;
		var proto = SvelteSet.prototype;
		var set_proto = Set.prototype;
		for (const method of read_methods) proto[method] = function(...v) {
			get(this.#version);
			return set_proto[method].apply(this, v);
		};
		for (const method of set_like_methods) proto[method] = function(...v) {
			get(this.#version);
			return new SvelteSet(set_proto[method].apply(this, v));
		};
	}
	/** @param {T} value */
	has(value) {
		var has = super.has(value);
		var sources = this.#sources;
		var s = sources.get(value);
		if (s === void 0) {
			if (!has) {
				get(this.#version);
				return false;
			}
			s = this.#source(true);
			if (dev_fallback_default) tag(s, `SvelteSet has(${label(value)})`);
			sources.set(value, s);
		}
		get(s);
		return has;
	}
	/** @param {T} value */
	add(value) {
		if (!super.has(value)) {
			super.add(value);
			set(this.#size, super.size);
			increment(this.#version);
		}
		return this;
	}
	/** @param {T} value */
	delete(value) {
		var deleted = super.delete(value);
		var sources = this.#sources;
		var s = sources.get(value);
		if (s !== void 0) {
			sources.delete(value);
			set(s, false);
		}
		if (deleted) {
			set(this.#size, super.size);
			increment(this.#version);
		}
		return deleted;
	}
	clear() {
		if (super.size === 0) return;
		super.clear();
		var sources = this.#sources;
		for (var s of sources.values()) set(s, false);
		sources.clear();
		set(this.#size, 0);
		increment(this.#version);
	}
	keys() {
		return this.values();
	}
	values() {
		get(this.#version);
		return super.values();
	}
	entries() {
		get(this.#version);
		return super.entries();
	}
	[Symbol.iterator]() {
		return this.keys();
	}
	get size() {
		return get(this.#size);
	}
};
//#endregion
//#region node_modules/svelte/src/motion/utils.js
/**
* @param {any} obj
* @returns {obj is Date}
*/
function is_date(obj) {
	return Object.prototype.toString.call(obj) === "[object Date]";
}
//#endregion
//#region node_modules/svelte/src/easing/index.js
/**
* @param {number} t
* @returns {number}
*/
function linear(t) {
	return t;
}
/**
* @param {number} t
* @returns {number}
*/
function cubicOut(t) {
	const f = t - 1;
	return f * f * f + 1;
}
//#endregion
//#region node_modules/svelte/src/motion/tweened.js
/** @import { Task } from '../internal/client/types' */
/** @import { Tweened, TweenOptions } from './public' */
/**
* @template T
* @param {T} a
* @param {T} b
* @returns {(t: number) => T}
*/
function get_interpolator(a, b) {
	if (a === b || a !== a) return () => a;
	const type = typeof a;
	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) throw new Error("Cannot interpolate values of different type");
	if (Array.isArray(a)) {
		const arr = b.map((bi, i) => {
			return get_interpolator(
				/** @type {Array<any>} */
				a[i],
				bi
			);
		});
		return (t) => arr.map((fn) => fn(t));
	}
	if (type === "object") {
		if (!a || !b) throw new Error("Object cannot be null");
		if (is_date(a) && is_date(b)) {
			const an = a.getTime();
			const delta = b.getTime() - an;
			return (t) => new Date(an + t * delta);
		}
		const keys = Object.keys(b);
		/** @type {Record<string, (t: number) => T>} */
		const interpolators = {};
		keys.forEach((key) => {
			interpolators[key] = get_interpolator(a[key], b[key]);
		});
		return (t) => {
			/** @type {Record<string, any>} */
			const result = {};
			keys.forEach((key) => {
				result[key] = interpolators[key](t);
			});
			return result;
		};
	}
	if (type === "number") {
		const delta = b - a;
		return (t) => a + t * delta;
	}
	return () => b;
}
/**
* A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.
*
* @deprecated Use [`Tween`](https://svelte.dev/docs/svelte/svelte-motion#Tween) instead
* @template T
* @param {T} [value]
* @param {TweenOptions<T>} [defaults]
* @returns {Tweened<T>}
*/
function tweened(value, defaults = {}) {
	const store = writable(value);
	/** @type {Task} */
	let task;
	let target_value = value;
	/**
	* @param {T} new_value
	* @param {TweenOptions<T>} [opts]
	*/
	function set(new_value, opts) {
		target_value = new_value;
		if (value == null) {
			store.set(value = new_value);
			return Promise.resolve();
		}
		/** @type {Task | null} */
		let previous_task = task;
		let started = false;
		let { delay = 0, duration = 400, easing = linear, interpolate = get_interpolator } = {
			...defaults,
			...opts
		};
		if (duration === 0) {
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}
			store.set(value = target_value);
			return Promise.resolve();
		}
		const start = raf.now() + delay;
		/** @type {(t: number) => T} */
		let fn;
		task = loop((now) => {
			if (now < start) return true;
			if (!started) {
				fn = interpolate(value, new_value);
				if (typeof duration === "function") duration = duration(value, new_value);
				started = true;
			}
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}
			const elapsed = now - start;
			if (elapsed > duration) {
				store.set(value = new_value);
				return false;
			}
			store.set(value = fn(easing(elapsed / duration)));
			return true;
		});
		return task.promise;
	}
	return {
		set,
		update: (fn, opts) => set(fn(target_value, value), opts),
		subscribe: store.subscribe
	};
}
//#endregion
//#region src/components/Knob.svelte
var root_1$3 = /* @__PURE__ */ from_svg(`<circle class="learn-ring svelte-1wmwmfc" fill="none" stroke-width="2"></circle>`);
var root_2$3 = /* @__PURE__ */ from_svg(`<path class="arc svelte-1wmwmfc" fill="none" stroke-width="3"></path>`);
var root_3$2 = /* @__PURE__ */ from_svg(`<text class="tick-label svelte-1wmwmfc" text-anchor="middle" dominant-baseline="middle"> </text>`);
var root_4$1 = /* @__PURE__ */ from_html(`<span class="interval-indicator svelte-1wmwmfc"> </span>`);
var root_5 = /* @__PURE__ */ from_html(`<span class="cc-label svelte-1wmwmfc"> </span>`);
var root$15 = /* @__PURE__ */ from_html(`<div><span> </span> <div class="knob-hit svelte-1wmwmfc"><svg viewBox="0 0 48 48" style="overflow: visible; width: var(--knob-body-size, 48px); height: var(--knob-body-size, 48px);"><!><path class="track svelte-1wmwmfc" fill="none" stroke-width="3"></path><!><circle r="13" class="body svelte-1wmwmfc"></circle><line class="indicator svelte-1wmwmfc" stroke-width="2" stroke-linecap="round"></line><!></svg></div> <!> <span> </span> <!></div>`);
function Knob($$anchor, $$props) {
	push($$props, true);
	const $animPos = () => store_get(animPos, "$animPos", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	/** @type {{
	label?: string,
	min?: number,
	max?: number,
	default?: number,
	value?: number,
	scale?: string,
	unit?: string,
	ticks?: Array<{ pos: number, label: string, r?: number }>,
	showLabel?: boolean,
	showValue?: boolean,
	showArc?: boolean,
	bipolar?: boolean,
	intervalIndicator?: boolean,
	step?: number | null,
	fineStep?: number | null,
	externalValue?: number,
	learningMidi?: boolean,
	assignedCc?: number | null,
	disabled?: boolean,
	onchange?: (e: { value: number }) => void,
	oncontextmenu?: () => void
	}} */
	let label = prop($$props, "label", 3, ""), min = prop($$props, "min", 3, 0), max = prop($$props, "max", 3, 1), defaultValue = prop($$props, "default", 3, .5), initialValue = prop($$props, "value", 3, void 0), scale = prop($$props, "scale", 3, "linear"), unit = prop($$props, "unit", 3, ""), ticks = prop($$props, "ticks", 19, () => []), showLabel = prop($$props, "showLabel", 3, true), showValue = prop($$props, "showValue", 3, true), showArc = prop($$props, "showArc", 3, true), bipolar = prop($$props, "bipolar", 3, false), intervalIndicator = prop($$props, "intervalIndicator", 3, false), step = prop($$props, "step", 3, null), fineStep = prop($$props, "fineStep", 3, null), externalValue = prop($$props, "externalValue", 3, void 0), learningMidi = prop($$props, "learningMidi", 3, false), assignedCc = prop($$props, "assignedCc", 3, null), disabled = prop($$props, "disabled", 3, false);
	let value = /* @__PURE__ */ state(proxy(untrack(() => initialValue() !== void 0 ? initialValue() : defaultValue())));
	const SWEEP = 270;
	const START_ANGLE = 225;
	const CX = 24;
	const CY = 24;
	const R = 18;
	/**
	* @param {number} angleDeg
	* @param {number} r
	*/
	function polarToXY(angleDeg, r) {
		const rad = (angleDeg - 90) * Math.PI / 180;
		return {
			x: CX + r * Math.cos(rad),
			y: CY + r * Math.sin(rad)
		};
	}
	/** @param {{ pos: number, label: string, r?: number }} tick */
	function tickXY(tick) {
		return polarToXY(START_ANGLE + tick.pos * SWEEP, tick.r ?? R + 10);
	}
	/** @param {number} pos */
	function arcPath(pos) {
		const startRad = (START_ANGLE - 90) * Math.PI / 180;
		const endRad = (START_ANGLE + pos * SWEEP - 90) * Math.PI / 180;
		const sx = CX + R * Math.cos(startRad);
		const sy = CY + R * Math.sin(startRad);
		const ex = CX + R * Math.cos(endRad);
		const ey = CY + R * Math.sin(endRad);
		return `M ${sx} ${sy} A ${R} ${R} 0 ${pos * SWEEP > 180 ? 1 : 0} 1 ${ex} ${ey}`;
	}
	/** @param {number} pos */
	function bipolarArcPath(pos) {
		if (Math.abs(pos - .5) < .001) return "";
		const centerRad = (START_ANGLE + .5 * SWEEP - 90) * Math.PI / 180;
		const cx2 = CX + R * Math.cos(centerRad);
		const cy2 = CY + R * Math.sin(centerRad);
		const endRad = (START_ANGLE + pos * SWEEP - 90) * Math.PI / 180;
		const ex = CX + R * Math.cos(endRad);
		const ey = CY + R * Math.sin(endRad);
		if (pos > .5) return `M ${cx2} ${cy2} A ${R} ${R} 0 ${(pos - .5) * SWEEP > 180 ? 1 : 0} 1 ${ex} ${ey}`;
		else return `M ${ex} ${ey} A ${R} ${R} 0 ${(.5 - pos) * SWEEP > 180 ? 1 : 0} 1 ${cx2} ${cy2}`;
	}
	let pos = /* @__PURE__ */ user_derived(() => valueToNormalized(get(value), min(), max(), scale()));
	const animPos = tweened(untrack(() => valueToNormalized(initialValue() !== void 0 ? initialValue() : defaultValue(), min(), max(), scale())), {
		duration: 0,
		easing: cubicOut
	});
	let indicatorEnd = /* @__PURE__ */ user_derived(() => polarToXY(START_ANGLE + $animPos() * SWEEP, R - 3));
	let activePath = /* @__PURE__ */ user_derived(() => showArc() ? bipolar() ? bipolarArcPath(get(pos)) : arcPath(get(pos)) : null);
	let dragging = false;
	let lastY = 0;
	let shiftHeld = false;
	user_effect(() => {
		if (externalValue() !== void 0 && !dragging) {
			const clamped = Math.max(min(), Math.min(max(), externalValue()));
			if (clamped !== get(value)) {
				set(value, clamped, true);
				$$props.onchange?.({ value: clamped });
				animPos.set(valueToNormalized(clamped, min(), max(), scale()), { duration: 100 });
			}
		}
	});
	/** @param {KeyboardEvent} e */
	function onShiftKey(e) {
		if (e.key === "Shift") shiftHeld = e.type === "keydown";
	}
	/** @param {PointerEvent & { currentTarget: Element }} e */
	function onPointerDown(e) {
		dragging = true;
		lastY = e.clientY;
		shiftHeld = e.shiftKey;
		e.currentTarget.setPointerCapture(e.pointerId);
		window.addEventListener("keydown", onShiftKey);
		window.addEventListener("keyup", onShiftKey);
	}
	/** @param {PointerEvent} e */
	function onPointerMove(e) {
		if (!dragging) return;
		shiftHeld = e.shiftKey;
		const delta = -(e.clientY - lastY);
		lastY = e.clientY;
		const sensitivity = shiftHeld ? .001 : .01;
		const rawValue = normalizedToValue(Math.max(0, Math.min(1, get(pos) + delta * sensitivity)), min(), max(), scale());
		const activeStep = shiftHeld && fineStep() !== null ? fineStep() : step();
		const newValue = activeStep !== null && activeStep > 0 ? Math.max(min(), Math.min(max(), Math.round(rawValue / activeStep) * activeStep)) : rawValue;
		set(value, newValue, true);
		animPos.set(valueToNormalized(newValue, min(), max(), scale()), { duration: 0 });
		$$props.onchange?.({ value: newValue });
	}
	function onPointerUp() {
		dragging = false;
		window.removeEventListener("keydown", onShiftKey);
		window.removeEventListener("keyup", onShiftKey);
	}
	onDestroy(() => {
		window.removeEventListener("keydown", onShiftKey);
		window.removeEventListener("keyup", onShiftKey);
	});
	function onDblClick() {
		set(value, defaultValue());
		animPos.set(valueToNormalized(defaultValue(), min(), max(), scale()), { duration: 0 });
		$$props.onchange?.({ value: defaultValue() });
	}
	/** @param {MouseEvent} e */
	function handleContextMenu(e) {
		e.preventDefault();
		$$props.oncontextmenu?.();
	}
	var div = root$15();
	let classes;
	var span = child(div);
	let classes_1;
	var text = child(span, true);
	reset(span);
	var div_1 = sibling(span, 2);
	var svg = child(div_1);
	var node = child(svg);
	var consequent = ($$anchor) => {
		var circle = root_1$3();
		set_attribute(circle, "cx", CX);
		set_attribute(circle, "cy", CY);
		set_attribute(circle, "r", R + 4);
		append($$anchor, circle);
	};
	if_block(node, ($$render) => {
		if (learningMidi()) $$render(consequent);
	});
	var path = sibling(node);
	var node_1 = sibling(path);
	var consequent_1 = ($$anchor) => {
		var path_1 = root_2$3();
		template_effect(() => set_attribute(path_1, "d", get(activePath)));
		append($$anchor, path_1);
	};
	if_block(node_1, ($$render) => {
		if (get(activePath)) $$render(consequent_1);
	});
	var circle_1 = sibling(node_1);
	set_attribute(circle_1, "cx", CX);
	set_attribute(circle_1, "cy", CY);
	var line = sibling(circle_1);
	set_attribute(line, "x1", CX);
	set_attribute(line, "y1", CY);
	each(sibling(line), 17, ticks, (tick) => tick.label, ($$anchor, tick) => {
		const xy = /* @__PURE__ */ user_derived(() => tickXY(get(tick)));
		var text_1 = root_3$2();
		var text_2 = child(text_1, true);
		reset(text_1);
		template_effect(() => {
			set_attribute(text_1, "x", get(xy).x);
			set_attribute(text_1, "y", get(xy).y);
			set_text(text_2, get(tick).label);
		});
		append($$anchor, text_1);
	});
	reset(svg);
	reset(div_1);
	var node_3 = sibling(div_1, 2);
	var consequent_2 = ($$anchor) => {
		const interval = /* @__PURE__ */ user_derived(() => detectInterval(get(value)));
		var span_1 = root_4$1();
		var text_3 = child(span_1, true);
		reset(span_1);
		template_effect(() => set_text(text_3, get(interval) ?? "\xA0"));
		append($$anchor, span_1);
	};
	if_block(node_3, ($$render) => {
		if (intervalIndicator()) $$render(consequent_2);
	});
	var span_2 = sibling(node_3, 2);
	let classes_2;
	var text_4 = child(span_2, true);
	reset(span_2);
	var node_4 = sibling(span_2, 2);
	var consequent_3 = ($$anchor) => {
		var span_3 = root_5();
		var text_5 = child(span_3);
		reset(span_3);
		template_effect(() => set_text(text_5, `CC ${assignedCc() ?? ""}`));
		append($$anchor, span_3);
	};
	if_block(node_4, ($$render) => {
		if (assignedCc() !== null) $$render(consequent_3);
	});
	reset(div);
	template_effect(($0, $1) => {
		classes = set_class(div, 1, "knob-wrap svelte-1wmwmfc", null, classes, { disabled: disabled() });
		classes_1 = set_class(span, 1, "knob-label svelte-1wmwmfc", null, classes_1, { invisible: !showLabel() });
		set_text(text, label());
		set_attribute(path, "d", $0);
		set_attribute(line, "x2", get(indicatorEnd).x);
		set_attribute(line, "y2", get(indicatorEnd).y);
		classes_2 = set_class(span_2, 1, "knob-value svelte-1wmwmfc", null, classes_2, { invisible: !showValue() });
		set_text(text_4, $1);
	}, [() => arcPath(1), () => formatValue(get(value), unit())]);
	delegated("pointerdown", div_1, onPointerDown);
	delegated("pointermove", div_1, onPointerMove);
	delegated("pointerup", div_1, onPointerUp);
	delegated("dblclick", div_1, onDblClick);
	delegated("contextmenu", div_1, handleContextMenu);
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate([
	"pointerdown",
	"pointermove",
	"pointerup",
	"dblclick",
	"contextmenu"
]);
//#endregion
//#region src/components/Oscillator.svelte
var root_1$2 = /* @__PURE__ */ from_html(`<button> </button>`);
var root_2$2 = /* @__PURE__ */ from_html(`<button> </button>`);
var root_3$1 = /* @__PURE__ */ from_html(`<button> </button>`);
var root$14 = /* @__PURE__ */ from_html(`<div class="panel svelte-19bkkl2"><span class="panel-label svelte-19bkkl2">oscillator bank</span> <div class="osc-section svelte-19bkkl2"><span class="osc-label svelte-19bkkl2">osc 1</span> <div class="wave-row svelte-19bkkl2"></div> <div class="range-row svelte-19bkkl2"><span class="param-label svelte-19bkkl2">range</span> <button class="step-btn svelte-19bkkl2">−</button> <span class="range-val svelte-19bkkl2"> </span> <button class="step-btn svelte-19bkkl2">+</button></div></div> <div class="osc-section svelte-19bkkl2"><span class="osc-label svelte-19bkkl2">osc 2</span> <div class="wave-row svelte-19bkkl2"></div> <div class="range-row svelte-19bkkl2"><span class="param-label svelte-19bkkl2">range</span> <button class="step-btn svelte-19bkkl2">−</button> <span class="range-val svelte-19bkkl2"> </span> <button class="step-btn svelte-19bkkl2">+</button> <!></div></div> <div class="osc-section svelte-19bkkl2"><span class="osc-label svelte-19bkkl2">osc 3</span> <div class="wave-row svelte-19bkkl2"></div> <div class="range-row svelte-19bkkl2"><span class="param-label svelte-19bkkl2">range</span> <button class="step-btn svelte-19bkkl2">−</button> <span class="range-val svelte-19bkkl2"> </span> <button class="step-btn svelte-19bkkl2">+</button> <!> <button>lfo</button> <!></div></div></div>`);
function Oscillator($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	onchange?: (e: { param: string, value: number }) => void,
	midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
	onknobcontextmenu?: (param: string) => void,
	reset?: number,
	}} */
	let midiState = prop($$props, "midiState", 19, () => ({})), reset$7 = prop($$props, "reset", 3, 0);
	const WAVEFORMS = [
		"tri",
		"rev-saw",
		"saw",
		"sq",
		"wide",
		"narrow"
	];
	let osc1Wave = /* @__PURE__ */ state(0);
	let osc1Range = /* @__PURE__ */ state(0);
	let osc2Wave = /* @__PURE__ */ state(0);
	let osc2Range = /* @__PURE__ */ state(0);
	let osc3Wave = /* @__PURE__ */ state(0);
	let osc3Range = /* @__PURE__ */ state(0);
	let osc3LfoMode = /* @__PURE__ */ state(0);
	/**
	* @param {number} osc
	* @param {number} i
	*/
	function selectWave(osc, i) {
		const param = `osc${osc}Wave`;
		if (osc === 1) set(osc1Wave, i, true);
		else if (osc === 2) set(osc2Wave, i, true);
		else set(osc3Wave, i, true);
		$$props.onchange?.({
			param,
			value: i
		});
	}
	/**
	* @param {number} osc
	* @param {number} delta
	*/
	function stepRange(osc, delta) {
		const current = osc === 1 ? get(osc1Range) : osc === 2 ? get(osc2Range) : get(osc3Range);
		const next = Math.max(-2, Math.min(2, current + delta));
		if (next === current) return;
		const param = `osc${osc}Range`;
		if (osc === 1) set(osc1Range, next, true);
		else if (osc === 2) set(osc2Range, next, true);
		else set(osc3Range, next, true);
		$$props.onchange?.({
			param,
			value: next
		});
	}
	function toggleLfoMode() {
		set(osc3LfoMode, get(osc3LfoMode) === 0 ? 1 : 0, true);
		$$props.onchange?.({
			param: "osc3LfoMode",
			value: get(osc3LfoMode)
		});
	}
	user_effect(() => {
		if (reset$7() === 0) return;
		set(osc1Wave, 0);
		set(osc2Wave, 0);
		set(osc3Wave, 0);
		set(osc1Range, 0);
		set(osc2Range, 0);
		set(osc3Range, 0);
		set(osc3LfoMode, 0);
		untrack(() => {
			$$props.onchange?.({
				param: "osc1Wave",
				value: 0
			});
			$$props.onchange?.({
				param: "osc2Wave",
				value: 0
			});
			$$props.onchange?.({
				param: "osc3Wave",
				value: 0
			});
			$$props.onchange?.({
				param: "osc1Range",
				value: 0
			});
			$$props.onchange?.({
				param: "osc2Range",
				value: 0
			});
			$$props.onchange?.({
				param: "osc3Range",
				value: 0
			});
			$$props.onchange?.({
				param: "osc3LfoMode",
				value: 0
			});
		});
	});
	var div = root$14();
	var div_1 = sibling(child(div), 2);
	var div_2 = sibling(child(div_1), 2);
	each(div_2, 21, () => WAVEFORMS, index, ($$anchor, name, i) => {
		var button = root_1$2();
		let classes;
		var text = child(button, true);
		reset(button);
		template_effect(() => {
			classes = set_class(button, 1, "wave-btn svelte-19bkkl2", null, classes, { active: get(osc1Wave) === i });
			set_text(text, get(name));
		});
		delegated("click", button, () => selectWave(1, i));
		append($$anchor, button);
	});
	reset(div_2);
	var div_3 = sibling(div_2, 2);
	var button_1 = sibling(child(div_3), 2);
	var span = sibling(button_1, 2);
	var text_1 = child(span);
	reset(span);
	var button_2 = sibling(span, 2);
	reset(div_3);
	reset(div_1);
	var div_4 = sibling(div_1, 2);
	var div_5 = sibling(child(div_4), 2);
	each(div_5, 21, () => WAVEFORMS, index, ($$anchor, name, i) => {
		var button_3 = root_2$2();
		let classes_1;
		var text_2 = child(button_3, true);
		reset(button_3);
		template_effect(() => {
			classes_1 = set_class(button_3, 1, "wave-btn svelte-19bkkl2", null, classes_1, { active: get(osc2Wave) === i });
			set_text(text_2, get(name));
		});
		delegated("click", button_3, () => selectWave(2, i));
		append($$anchor, button_3);
	});
	reset(div_5);
	var div_6 = sibling(div_5, 2);
	var button_4 = sibling(child(div_6), 2);
	var span_1 = sibling(button_4, 2);
	var text_3 = child(span_1);
	reset(span_1);
	var button_5 = sibling(span_1, 2);
	var node = sibling(button_5, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.osc2Detune?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.osc2Detune?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.osc2Detune?.assignedCc ?? null);
		Knob(node, {
			label: "freq",
			min: -700,
			max: 700,
			default: 0,
			unit: "st",
			bipolar: true,
			intervalIndicator: true,
			step: 5,
			fineStep: 1,
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "osc2Detune",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("osc2Detune")
		});
	}
	reset(div_6);
	reset(div_4);
	var div_7 = sibling(div_4, 2);
	var div_8 = sibling(child(div_7), 2);
	each(div_8, 21, () => WAVEFORMS, index, ($$anchor, name, i) => {
		var button_6 = root_3$1();
		let classes_2;
		var text_4 = child(button_6, true);
		reset(button_6);
		template_effect(() => {
			classes_2 = set_class(button_6, 1, "wave-btn svelte-19bkkl2", null, classes_2, { active: get(osc3Wave) === i });
			set_text(text_4, get(name));
		});
		delegated("click", button_6, () => selectWave(3, i));
		append($$anchor, button_6);
	});
	reset(div_8);
	var div_9 = sibling(div_8, 2);
	var button_7 = sibling(child(div_9), 2);
	var span_2 = sibling(button_7, 2);
	var text_5 = child(span_2);
	reset(span_2);
	var button_8 = sibling(span_2, 2);
	var node_1 = sibling(button_8, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(osc3LfoMode) === 1);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.osc3Detune?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.osc3Detune?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.osc3Detune?.assignedCc ?? null);
		Knob(node_1, {
			label: "freq",
			min: -700,
			max: 700,
			default: 0,
			unit: "st",
			bipolar: true,
			intervalIndicator: true,
			step: 5,
			fineStep: 1,
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "osc3Detune",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("osc3Detune")
		});
	}
	var button_9 = sibling(node_1, 2);
	let classes_3;
	var node_2 = sibling(button_9, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(osc3LfoMode) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.osc3LfoRate?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.osc3LfoRate?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.osc3LfoRate?.assignedCc ?? null);
		Knob(node_2, {
			label: "rate",
			min: .1,
			max: 20,
			default: 1,
			scale: "log",
			unit: "Hz",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "osc3LfoRate",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("osc3LfoRate")
		});
	}
	reset(div_9);
	reset(div_7);
	reset(div);
	template_effect(() => {
		set_text(text_1, `${get(osc1Range) > 0 ? "+" : ""}${get(osc1Range) ?? ""}`);
		set_text(text_3, `${get(osc2Range) > 0 ? "+" : ""}${get(osc2Range) ?? ""}`);
		button_7.disabled = get(osc3LfoMode) === 1;
		set_text(text_5, `${get(osc3Range) > 0 ? "+" : ""}${get(osc3Range) ?? ""}`);
		button_8.disabled = get(osc3LfoMode) === 1;
		classes_3 = set_class(button_9, 1, "lfo-btn svelte-19bkkl2", null, classes_3, { active: get(osc3LfoMode) === 1 });
		set_attribute(button_9, "aria-pressed", get(osc3LfoMode) === 1);
	});
	delegated("click", button_1, () => stepRange(1, -1));
	delegated("click", button_2, () => stepRange(1, 1));
	delegated("click", button_4, () => stepRange(2, -1));
	delegated("click", button_5, () => stepRange(2, 1));
	delegated("click", button_7, () => stepRange(3, -1));
	delegated("click", button_8, () => stepRange(3, 1));
	delegated("click", button_9, toggleLfoMode);
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/LevelLed.svelte
var root$13 = /* @__PURE__ */ from_html(`<div class="level-led svelte-1hlnysh"></div>`);
function LevelLed($$anchor, $$props) {
	push($$props, true);
	/** @type {{ getPeak?: () => number, powered?: boolean }} */
	let getPeak = prop($$props, "getPeak", 3, () => 0), powered = prop($$props, "powered", 3, false);
	let color = /* @__PURE__ */ state("#111111");
	let rafHandle = 0;
	let latchHandle = 0;
	/** @param {number} peak */
	function computeColor(peak) {
		if (peak <= 0) return "#111111";
		let hue;
		if (peak < .5) hue = 120 - peak / .5 * 60;
		else if (peak < .85) hue = 60 - (peak - .5) / .35 * 30;
		else hue = Math.max(0, 30 - (peak - .85) / .15 * 30);
		return `hsl(${Math.round(hue)}, 100%, 50%)`;
	}
	function tick() {
		if (!powered()) {
			set(color, "#111111");
			rafHandle = 0;
			return;
		}
		const peak = getPeak()();
		if (peak > 1) {
			set(color, "hsl(0, 100%, 50%)");
			clearTimeout(latchHandle);
			latchHandle = setTimeout(() => {
				latchHandle = 0;
			}, 1500);
		} else if (latchHandle === 0) set(color, computeColor(peak), true);
		rafHandle = requestAnimationFrame(tick);
	}
	user_effect(() => {
		if (powered()) {
			if (!rafHandle) rafHandle = requestAnimationFrame(tick);
		} else {
			if (rafHandle) {
				cancelAnimationFrame(rafHandle);
				rafHandle = 0;
			}
			clearTimeout(latchHandle);
			latchHandle = 0;
			set(color, "#111111");
		}
		return () => {
			cancelAnimationFrame(rafHandle);
			clearTimeout(latchHandle);
		};
	});
	onDestroy(() => {
		cancelAnimationFrame(rafHandle);
		clearTimeout(latchHandle);
	});
	var div = root$13();
	let styles;
	template_effect(() => styles = set_style(div, "", styles, { "--led-color": get(color) }));
	append($$anchor, div);
	pop();
}
//#endregion
//#region src/components/Mixer.svelte
var root$12 = /* @__PURE__ */ from_html(`<div class="panel svelte-gq0xe5"><div class="panel-header svelte-gq0xe5"><span class="panel-label svelte-gq0xe5">mixer</span> <!></div> <div class="mixer-col svelte-gq0xe5"><!> <!> <!> <div class="section-divider svelte-gq0xe5"></div> <div class="noise-row svelte-gq0xe5"><!> <div class="noise-type-row svelte-gq0xe5"><button>wht</button> <button>pink</button></div></div></div></div>`);
function Mixer($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	onchange?: (e: { param: string, value: number }) => void,
	midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
	onknobcontextmenu?: (param: string) => void,
	reset?: number,
	getPeak?: () => number,
	powered?: boolean,
	}} */
	let midiState = prop($$props, "midiState", 19, () => ({})), reset$6 = prop($$props, "reset", 3, 0), getPeak = prop($$props, "getPeak", 3, () => 0), powered = prop($$props, "powered", 3, false);
	let noiseType = /* @__PURE__ */ state(0);
	/** @param {number} t */
	function selectNoiseType(t) {
		if (t === get(noiseType)) return;
		set(noiseType, t, true);
		$$props.onchange?.({
			param: "noiseType",
			value: get(noiseType)
		});
	}
	user_effect(() => {
		if (reset$6() === 0) return;
		set(noiseType, 0);
		untrack(() => $$props.onchange?.({
			param: "noiseType",
			value: 0
		}));
	});
	var div = root$12();
	var div_1 = child(div);
	LevelLed(sibling(child(div_1), 2), {
		get getPeak() {
			return getPeak();
		},
		get powered() {
			return powered();
		}
	});
	reset(div_1);
	var div_2 = sibling(div_1, 2);
	var node_1 = child(div_2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.osc1Level?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.osc1Level?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.osc1Level?.assignedCc ?? null);
		Knob(node_1, {
			label: "osc 1",
			min: 0,
			max: 1,
			default: .75,
			scale: "linear",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "osc1Level",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("osc1Level")
		});
	}
	var node_2 = sibling(node_1, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.osc2Level?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.osc2Level?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.osc2Level?.assignedCc ?? null);
		Knob(node_2, {
			label: "osc 2",
			min: 0,
			max: 1,
			default: 0,
			scale: "linear",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "osc2Level",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("osc2Level")
		});
	}
	var node_3 = sibling(node_2, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.osc3Level?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.osc3Level?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.osc3Level?.assignedCc ?? null);
		Knob(node_3, {
			label: "osc 3",
			min: 0,
			max: 1,
			default: 0,
			scale: "linear",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "osc3Level",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("osc3Level")
		});
	}
	var div_3 = sibling(node_3, 4);
	var node_4 = child(div_3);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.noiseLevel?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.noiseLevel?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.noiseLevel?.assignedCc ?? null);
		Knob(node_4, {
			label: "noise",
			min: 0,
			max: 1,
			default: 0,
			scale: "linear",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "noiseLevel",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("noiseLevel")
		});
	}
	var div_4 = sibling(node_4, 2);
	var button = child(div_4);
	let classes;
	var button_1 = sibling(button, 2);
	let classes_1;
	reset(div_4);
	reset(div_3);
	reset(div_2);
	reset(div);
	template_effect(() => {
		classes = set_class(button, 1, "noise-btn svelte-gq0xe5", null, classes, { active: get(noiseType) === 0 });
		classes_1 = set_class(button_1, 1, "noise-btn svelte-gq0xe5", null, classes_1, { active: get(noiseType) === 1 });
	});
	delegated("click", button, () => selectNoiseType(0));
	delegated("click", button_1, () => selectNoiseType(1));
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/Filter.svelte
var root$11 = /* @__PURE__ */ from_html(`<div class="panel svelte-xeds7y"><span class="panel-label svelte-xeds7y">filter</span> <div class="knob-row centered svelte-xeds7y"><!> <!> <div class="key-track-col svelte-xeds7y"><div class="key-track-btn-wrap svelte-xeds7y"><button>KEY TRACK</button></div></div></div> <div class="section-divider svelte-xeds7y"></div> <div class="contour-header svelte-xeds7y"><span class="sub-label svelte-xeds7y">filter contour</span></div> <div class="knob-row svelte-xeds7y"><!> <!> <!> <!> <!></div></div>`);
function Filter($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	onchange?: (e: { param: string, value: number }) => void,
	midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
	onknobcontextmenu?: (param: string) => void,
	reset?: number,
	}} */
	let midiState = prop($$props, "midiState", 19, () => ({})), reset$5 = prop($$props, "reset", 3, 0);
	let keyTrackOn = /* @__PURE__ */ state(0);
	function toggleKeyTrack() {
		set(keyTrackOn, get(keyTrackOn) === 0 ? 1 : 0, true);
		$$props.onchange?.({
			param: "keyTrack",
			value: get(keyTrackOn)
		});
	}
	user_effect(() => {
		if (reset$5() === 0) return;
		set(keyTrackOn, 0);
		untrack(() => $$props.onchange?.({
			param: "keyTrack",
			value: 0
		}));
	});
	var div = root$11();
	var div_1 = sibling(child(div), 2);
	var node = child(div_1);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.cutoff?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.cutoff?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.cutoff?.assignedCc ?? null);
		Knob(node, {
			label: "cutoff",
			min: 20,
			max: 2e4,
			default: 2e3,
			scale: "log",
			unit: "Hz",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "cutoff",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("cutoff")
		});
	}
	var node_1 = sibling(node, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.resonance?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.resonance?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.resonance?.assignedCc ?? null);
		Knob(node_1, {
			label: "res",
			min: 0,
			max: 1,
			default: .3,
			scale: "linear",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "resonance",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("resonance")
		});
	}
	var div_2 = sibling(node_1, 2);
	var div_3 = child(div_2);
	var button = child(div_3);
	let classes;
	reset(div_3);
	reset(div_2);
	reset(div_1);
	var div_4 = sibling(div_1, 6);
	var node_2 = child(div_4);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.filterAttack?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.filterAttack?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.filterAttack?.assignedCc ?? null);
		Knob(node_2, {
			label: "attack",
			min: .001,
			max: 4,
			default: .01,
			scale: "log",
			unit: "s",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "filterAttack",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("filterAttack")
		});
	}
	var node_3 = sibling(node_2, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.filterDecay?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.filterDecay?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.filterDecay?.assignedCc ?? null);
		Knob(node_3, {
			label: "decay",
			min: .001,
			max: 4,
			default: .3,
			scale: "log",
			unit: "s",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "filterDecay",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("filterDecay")
		});
	}
	var node_4 = sibling(node_3, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.filterSustain?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.filterSustain?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.filterSustain?.assignedCc ?? null);
		Knob(node_4, {
			label: "sustain",
			min: 0,
			max: 1,
			default: .5,
			scale: "linear",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "filterSustain",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("filterSustain")
		});
	}
	var node_5 = sibling(node_4, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.filterRelease?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.filterRelease?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.filterRelease?.assignedCc ?? null);
		Knob(node_5, {
			label: "release",
			min: .001,
			max: 8,
			default: .3,
			scale: "log",
			unit: "s",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "filterRelease",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("filterRelease")
		});
	}
	var node_6 = sibling(node_5, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.filterEnvAmt?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.filterEnvAmt?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.filterEnvAmt?.assignedCc ?? null);
		Knob(node_6, {
			label: "amount",
			min: 0,
			max: 1e4,
			default: 0,
			scale: "linear",
			unit: "Hz",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "filterEnvAmt",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("filterEnvAmt")
		});
	}
	reset(div_4);
	reset(div);
	template_effect(() => {
		classes = set_class(button, 1, "toggle-btn svelte-xeds7y", null, classes, { active: get(keyTrackOn) === 1 });
		set_attribute(button, "aria-pressed", get(keyTrackOn) === 1);
	});
	delegated("click", button, toggleKeyTrack);
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/Effects.svelte
var root$10 = /* @__PURE__ */ from_html(`<div class="panel svelte-123klp2"><span class="panel-label svelte-123klp2">effects</span> <div class="section-header svelte-123klp2"><span class="sub-label svelte-123klp2">delay</span> <button> </button></div> <div class="effects-row svelte-123klp2"><!> <!> <!></div> <div class="mod-row svelte-123klp2"><button>MOD</button> <!> <!></div> <div class="section-divider svelte-123klp2"></div> <div class="section-header svelte-123klp2"><span class="sub-label svelte-123klp2">reverb</span> <button> </button></div> <div class="effects-row reverb-row svelte-123klp2"><!> <!> <!> <!></div></div>`);
function Effects($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	onchange?: (e: { param: string, value: number }) => void,
	midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
	onknobcontextmenu?: (param: string) => void,
	reset?: number,
	}} */
	let midiState = prop($$props, "midiState", 19, () => ({})), reset$4 = prop($$props, "reset", 3, 0);
	let delayOn = /* @__PURE__ */ state(0);
	let delayModOn = /* @__PURE__ */ state(0);
	let reverbOn = /* @__PURE__ */ state(0);
	function toggleDelay() {
		set(delayOn, get(delayOn) === 0 ? 1 : 0, true);
		$$props.onchange?.({
			param: "delayOn",
			value: get(delayOn)
		});
	}
	function toggleDelayMod() {
		set(delayModOn, get(delayModOn) === 0 ? 1 : 0, true);
		$$props.onchange?.({
			param: "delayModOn",
			value: get(delayModOn)
		});
	}
	function toggleReverb() {
		set(reverbOn, get(reverbOn) === 0 ? 1 : 0, true);
		$$props.onchange?.({
			param: "reverbOn",
			value: get(reverbOn)
		});
	}
	user_effect(() => {
		if (reset$4() === 0) return;
		set(delayOn, 0);
		set(delayModOn, 0);
		set(reverbOn, 0);
		untrack(() => {
			$$props.onchange?.({
				param: "delayOn",
				value: 0
			});
			$$props.onchange?.({
				param: "delayModOn",
				value: 0
			});
			$$props.onchange?.({
				param: "reverbOn",
				value: 0
			});
		});
	});
	var div = root$10();
	var div_1 = sibling(child(div), 2);
	var button = sibling(child(div_1), 2);
	let classes;
	var text = child(button, true);
	reset(button);
	reset(div_1);
	var div_2 = sibling(div_1, 2);
	var node = child(div_2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(delayOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.delayTime?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.delayTime?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.delayTime?.assignedCc ?? null);
		Knob(node, {
			label: "time",
			min: .01,
			max: 2,
			default: .3,
			scale: "linear",
			unit: "s",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "delayTime",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("delayTime")
		});
	}
	var node_1 = sibling(node, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(delayOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.delayFeedback?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.delayFeedback?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.delayFeedback?.assignedCc ?? null);
		Knob(node_1, {
			label: "feedback",
			min: 0,
			max: .9,
			default: .3,
			scale: "linear",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "delayFeedback",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("delayFeedback")
		});
	}
	var node_2 = sibling(node_1, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(delayOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.delayMix?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.delayMix?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.delayMix?.assignedCc ?? null);
		Knob(node_2, {
			label: "mix",
			min: 0,
			max: 1,
			default: .3,
			scale: "linear",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "delayMix",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("delayMix")
		});
	}
	reset(div_2);
	var div_3 = sibling(div_2, 2);
	var button_1 = child(div_3);
	let classes_1;
	var node_3 = sibling(button_1, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(delayOn) === 0 || get(delayModOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.delayModRate?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.delayModRate?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.delayModRate?.assignedCc ?? null);
		Knob(node_3, {
			label: "rate",
			min: .1,
			max: 10,
			default: .5,
			scale: "log",
			unit: "Hz",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "delayModRate",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("delayModRate")
		});
	}
	var node_4 = sibling(node_3, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(delayOn) === 0 || get(delayModOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.delayModDepth?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.delayModDepth?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.delayModDepth?.assignedCc ?? null);
		Knob(node_4, {
			label: "depth",
			min: 0,
			max: .025,
			default: 0,
			scale: "linear",
			unit: "s",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "delayModDepth",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("delayModDepth")
		});
	}
	reset(div_3);
	var div_4 = sibling(div_3, 4);
	var button_2 = sibling(child(div_4), 2);
	let classes_2;
	var text_1 = child(button_2, true);
	reset(button_2);
	reset(div_4);
	var div_5 = sibling(div_4, 2);
	var node_5 = child(div_5);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(reverbOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.reverbSend?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.reverbSend?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.reverbSend?.assignedCc ?? null);
		Knob(node_5, {
			label: "send",
			min: 0,
			max: 1,
			default: .3,
			scale: "linear",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "reverbSend",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("reverbSend")
		});
	}
	var node_6 = sibling(node_5, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(reverbOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.reverbDamp?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.reverbDamp?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.reverbDamp?.assignedCc ?? null);
		Knob(node_6, {
			label: "damp",
			min: 0,
			max: 1,
			default: .5,
			scale: "linear",
			showValue: false,
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "reverbDamp",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("reverbDamp")
		});
	}
	var node_7 = sibling(node_6, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(reverbOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.reverbDecay?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.reverbDecay?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.reverbDecay?.assignedCc ?? null);
		Knob(node_7, {
			label: "decay",
			min: .01,
			max: 1,
			default: .5,
			scale: "log-reverse",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "reverbDecay",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("reverbDecay")
		});
	}
	var node_8 = sibling(node_7, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(reverbOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.reverbPreDelay?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.reverbPreDelay?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.reverbPreDelay?.assignedCc ?? null);
		Knob(node_8, {
			label: "pre-delay",
			min: 0,
			max: .1,
			default: .015,
			scale: "linear",
			unit: "s",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "reverbPreDelay",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("reverbPreDelay")
		});
	}
	reset(div_5);
	reset(div);
	template_effect(() => {
		classes = set_class(button, 1, "toggle-btn svelte-123klp2", null, classes, { active: get(delayOn) === 1 });
		set_attribute(button, "aria-pressed", get(delayOn) === 1);
		set_text(text, get(delayOn) === 1 ? "on" : "off");
		classes_1 = set_class(button_1, 1, "toggle-btn svelte-123klp2", null, classes_1, { active: get(delayModOn) === 1 });
		set_attribute(button_1, "aria-pressed", get(delayModOn) === 1);
		button_1.disabled = get(delayOn) === 0;
		classes_2 = set_class(button_2, 1, "toggle-btn svelte-123klp2", null, classes_2, { active: get(reverbOn) === 1 });
		set_attribute(button_2, "aria-pressed", get(reverbOn) === 1);
		set_text(text_1, get(reverbOn) === 1 ? "on" : "off");
	});
	delegated("click", button, toggleDelay);
	delegated("click", button_1, toggleDelayMod);
	delegated("click", button_2, toggleReverb);
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/AmpEnv.svelte
var root$9 = /* @__PURE__ */ from_html(`<div class="panel svelte-7n4nfz"><div class="panel-header svelte-7n4nfz"><span class="panel-label svelte-7n4nfz">output</span> <!></div> <div class="knob-row centered svelte-7n4nfz"><!></div> <div class="section-divider svelte-7n4nfz"></div> <div class="contour-header svelte-7n4nfz"><span class="sub-label svelte-7n4nfz">loudness contour</span> <button title="Decay/Release lock">d/r</button></div> <div class="knob-row svelte-7n4nfz"><!> <!> <!> <!></div></div>`);
function AmpEnv($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	onchange?: (e: { param: string, value: number }) => void,
	midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
	onknobcontextmenu?: (param: string) => void,
	reset?: number,
	getOutputPeak?: () => number,
	powered?: boolean,
	}} */
	let midiState = prop($$props, "midiState", 19, () => ({})), reset$3 = prop($$props, "reset", 3, 0), getOutputPeak = prop($$props, "getOutputPeak", 3, () => 0), powered = prop($$props, "powered", 3, false);
	let drLock = /* @__PURE__ */ state(1);
	let decayValue = /* @__PURE__ */ state(.5);
	function toggleDrLock() {
		set(drLock, get(drLock) === 0 ? 1 : 0, true);
		$$props.onchange?.({
			param: "drLock",
			value: get(drLock)
		});
	}
	user_effect(() => {
		if (reset$3() === 0) return;
		set(drLock, 1);
		untrack(() => $$props.onchange?.({
			param: "drLock",
			value: 1
		}));
	});
	var div = root$9();
	var div_1 = child(div);
	LevelLed(sibling(child(div_1), 2), {
		get getPeak() {
			return getOutputPeak();
		},
		get powered() {
			return powered();
		}
	});
	reset(div_1);
	var div_2 = sibling(div_1, 2);
	var node_1 = child(div_2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.masterVol?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.masterVol?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.masterVol?.assignedCc ?? null);
		Knob(node_1, {
			label: "volume",
			min: 0,
			max: 1,
			default: .75,
			scale: "linear",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "masterVol",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("masterVol")
		});
	}
	reset(div_2);
	var div_3 = sibling(div_2, 4);
	var button = sibling(child(div_3), 2);
	let classes;
	reset(div_3);
	var div_4 = sibling(div_3, 2);
	var node_2 = child(div_4);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.ampAttack?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.ampAttack?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.ampAttack?.assignedCc ?? null);
		Knob(node_2, {
			label: "attack",
			min: .001,
			max: 4,
			default: .01,
			scale: "log",
			unit: "s",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "ampAttack",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("ampAttack")
		});
	}
	var node_3 = sibling(node_2, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.ampDecay?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.ampDecay?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.ampDecay?.assignedCc ?? null);
		Knob(node_3, {
			label: "decay",
			min: .001,
			max: 4,
			default: .5,
			scale: "log",
			unit: "s",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => {
				set(decayValue, e.value, true);
				$$props.onchange?.({
					param: "ampDecay",
					value: e.value
				});
			},
			oncontextmenu: () => $$props.onknobcontextmenu?.("ampDecay")
		});
	}
	var node_4 = sibling(node_3, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.ampSustain?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.ampSustain?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.ampSustain?.assignedCc ?? null);
		Knob(node_4, {
			label: "sustain",
			min: 0,
			max: 1,
			default: .7,
			scale: "linear",
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "ampSustain",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("ampSustain")
		});
	}
	var node_5 = sibling(node_4, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(drLock) === 1);
		let $1 = /* @__PURE__ */ user_derived(() => get(drLock) === 1 ? get(decayValue) : midiState()?.ampRelease?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.ampRelease?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.ampRelease?.assignedCc ?? null);
		Knob(node_5, {
			label: "release",
			min: .001,
			max: 8,
			default: .3,
			scale: "log",
			unit: "s",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "ampRelease",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("ampRelease")
		});
	}
	reset(div_4);
	reset(div);
	template_effect(() => {
		classes = set_class(button, 1, "drlock-btn svelte-7n4nfz", null, classes, { active: get(drLock) === 1 });
		set_attribute(button, "aria-pressed", get(drLock) === 1);
	});
	delegated("click", button, toggleDrLock);
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/Modulation.svelte
var root$8 = /* @__PURE__ */ from_html(`<div class="panel svelte-1ddpss2"><span class="panel-label svelte-1ddpss2">modulation</span> <div class="mod-layout svelte-1ddpss2"><div data-testid="mod-mix-knob"><!></div> <div class="routes svelte-1ddpss2"><button>osc 1</button> <button>osc 2</button> <button>filter</button></div></div></div>`);
function Modulation($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	onchange?: (e: { param: string, value: number }) => void,
	midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
	onknobcontextmenu?: (param: string) => void,
	reset?: number,
	}} */
	let midiState = prop($$props, "midiState", 19, () => ({})), reset$2 = prop($$props, "reset", 3, 0);
	let modToOsc1 = /* @__PURE__ */ state(0);
	let modToOsc2 = /* @__PURE__ */ state(0);
	let modToFilter = /* @__PURE__ */ state(0);
	user_effect(() => {
		if (reset$2() === 0) return;
		set(modToOsc1, 0);
		set(modToOsc2, 0);
		set(modToFilter, 0);
		untrack(() => {
			$$props.onchange?.({
				param: "modToOsc1",
				value: 0
			});
			$$props.onchange?.({
				param: "modToOsc2",
				value: 0
			});
			$$props.onchange?.({
				param: "modToFilter",
				value: 0
			});
		});
	});
	function toggleRoute(param) {
		if (param === "modToOsc1") {
			set(modToOsc1, get(modToOsc1) === 0 ? 1 : 0, true);
			$$props.onchange?.({
				param,
				value: get(modToOsc1)
			});
		} else if (param === "modToOsc2") {
			set(modToOsc2, get(modToOsc2) === 0 ? 1 : 0, true);
			$$props.onchange?.({
				param,
				value: get(modToOsc2)
			});
		} else if (param === "modToFilter") {
			set(modToFilter, get(modToFilter) === 0 ? 1 : 0, true);
			$$props.onchange?.({
				param,
				value: get(modToFilter)
			});
		}
	}
	var div = root$8();
	var div_1 = sibling(child(div), 2);
	var div_2 = child(div_1);
	var node = child(div_2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => midiState()?.modMix?.externalValue);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.modMix?.learningMidi ?? false);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.modMix?.assignedCc ?? null);
		Knob(node, {
			label: "mix",
			min: 0,
			max: 1,
			default: 0,
			scale: "linear",
			showValue: false,
			bipolar: true,
			ticks: [{
				pos: 0,
				label: "LFO"
			}, {
				pos: 1,
				label: "NOISE"
			}],
			get externalValue() {
				return get($0);
			},
			get learningMidi() {
				return get($1);
			},
			get assignedCc() {
				return get($2);
			},
			onchange: (e) => $$props.onchange?.({
				param: "modMix",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("modMix")
		});
	}
	reset(div_2);
	var div_3 = sibling(div_2, 2);
	var button = child(div_3);
	let classes;
	var button_1 = sibling(button, 2);
	let classes_1;
	var button_2 = sibling(button_1, 2);
	let classes_2;
	reset(div_3);
	reset(div_1);
	reset(div);
	template_effect(() => {
		classes = set_class(button, 1, "route-btn svelte-1ddpss2", null, classes, { active: get(modToOsc1) === 1 });
		set_attribute(button, "aria-pressed", get(modToOsc1) === 1);
		classes_1 = set_class(button_1, 1, "route-btn svelte-1ddpss2", null, classes_1, { active: get(modToOsc2) === 1 });
		set_attribute(button_1, "aria-pressed", get(modToOsc2) === 1);
		classes_2 = set_class(button_2, 1, "route-btn svelte-1ddpss2", null, classes_2, { active: get(modToFilter) === 1 });
		set_attribute(button_2, "aria-pressed", get(modToFilter) === 1);
	});
	delegated("click", button, () => toggleRoute("modToOsc1"));
	delegated("click", button_1, () => toggleRoute("modToOsc2"));
	delegated("click", button_2, () => toggleRoute("modToFilter"));
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/Glide.svelte
var root$7 = /* @__PURE__ */ from_html(`<div class="panel svelte-oqc131"><span class="panel-label svelte-oqc131">glide</span> <div class="glide-row svelte-oqc131"><button> </button> <!></div></div>`);
function Glide($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	onchange?: (e: { param: string, value: number }) => void,
	midiState?: { [key: string]: { externalValue?: number, learningMidi?: boolean, assignedCc?: number | null } },
	onknobcontextmenu?: (param: string) => void,
	reset?: number,
	}} */
	let midiState = prop($$props, "midiState", 19, () => ({})), reset$1 = prop($$props, "reset", 3, 0);
	let glideOn = /* @__PURE__ */ state(0);
	function toggleGlide() {
		set(glideOn, get(glideOn) === 0 ? 1 : 0, true);
		$$props.onchange?.({
			param: "glideOn",
			value: get(glideOn)
		});
	}
	user_effect(() => {
		if (reset$1() === 0) return;
		set(glideOn, 0);
		untrack(() => $$props.onchange?.({
			param: "glideOn",
			value: 0
		}));
	});
	var div = root$7();
	var div_1 = sibling(child(div), 2);
	var button = child(div_1);
	let classes;
	var text = child(button, true);
	reset(button);
	var node = sibling(button, 2);
	{
		let $0 = /* @__PURE__ */ user_derived(() => get(glideOn) === 0);
		let $1 = /* @__PURE__ */ user_derived(() => midiState()?.glideRate?.externalValue);
		let $2 = /* @__PURE__ */ user_derived(() => midiState()?.glideRate?.learningMidi ?? false);
		let $3 = /* @__PURE__ */ user_derived(() => midiState()?.glideRate?.assignedCc ?? null);
		Knob(node, {
			label: "rate",
			min: .001,
			max: 5,
			default: .2,
			scale: "log",
			unit: "s",
			get disabled() {
				return get($0);
			},
			get externalValue() {
				return get($1);
			},
			get learningMidi() {
				return get($2);
			},
			get assignedCc() {
				return get($3);
			},
			onchange: (e) => $$props.onchange?.({
				param: "glideRate",
				value: e.value
			}),
			oncontextmenu: () => $$props.onknobcontextmenu?.("glideRate")
		});
	}
	reset(div_1);
	reset(div);
	template_effect(() => {
		classes = set_class(button, 1, "glide-btn svelte-oqc131", null, classes, { active: get(glideOn) === 1 });
		set_attribute(button, "aria-pressed", get(glideOn) === 1);
		set_text(text, get(glideOn) === 1 ? "on" : "off");
	});
	delegated("click", button, toggleGlide);
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/Keyboard.svelte
var root_1$1 = /* @__PURE__ */ from_svg(`<rect></rect>`);
var root_2$1 = /* @__PURE__ */ from_svg(`<rect></rect>`);
var root_3 = /* @__PURE__ */ from_svg(`<text text-anchor="middle" class="key-label svelte-1dlz8xf"> </text>`);
var root_4 = /* @__PURE__ */ from_svg(`<text text-anchor="middle" class="key-label-black svelte-1dlz8xf"> </text>`);
var root$6 = /* @__PURE__ */ from_html(`<div class="keyboard-wrap svelte-1dlz8xf"><svg><rect fill="#333"></rect><!><!><!><!></svg></div>`);
function Keyboard($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	onnote?: (msgs: Array<{ param: string, value: number }>) => void,
	triggerNote?: ((midi: number) => void) | null,
	releaseNote?: ((midi: number) => void) | null,
	baseMidi?: number,
	}} */
	let triggerNote = prop($$props, "triggerNote", 15, null), releaseNote = prop($$props, "releaseNote", 15, null), baseMidi = prop($$props, "baseMidi", 3, 36);
	const BLACK_SEMITONES = new Set([
		1,
		3,
		6,
		8,
		10
	]);
	const RAIL_H = 1;
	const WHITE_W = 28;
	const WHITE_H = 100;
	const BLACK_W = 18;
	const BLACK_H = 60;
	/**
	* @param {number} base
	* @param {number} count
	*/
	function buildKeys(base, count) {
		let whiteIdx = 0;
		return Array.from({ length: count }, (_, i) => {
			const midi = base + i;
			const black = BLACK_SEMITONES.has(midi % 12);
			let x;
			if (!black) {
				x = whiteIdx * WHITE_W;
				whiteIdx++;
			} else x = (whiteIdx - 1) * WHITE_W + WHITE_W - BLACK_W / 2;
			return {
				midi,
				black,
				x
			};
		});
	}
	const keys = /* @__PURE__ */ user_derived(() => buildKeys(baseMidi(), 61));
	const whiteKeys = /* @__PURE__ */ user_derived(() => get(keys).filter((k) => !k.black));
	const totalWidth = /* @__PURE__ */ user_derived(() => get(whiteKeys).length * WHITE_W);
	/** @param {number} midi */
	function midiToNoteName(midi) {
		return `${[
			"C",
			"C#",
			"D",
			"D#",
			"E",
			"F",
			"F#",
			"G",
			"G#",
			"A",
			"A#",
			"B"
		][midi % 12]}${Math.floor(midi / 12) - 1}`;
	}
	const activeKeys = new SvelteSet();
	const pressedQwerty = new SvelteSet();
	function _triggerNote(midi) {
		const freq = midiToFreq(midi);
		const wasActive = activeKeys.size > 0;
		activeKeys.add(midi);
		$$props.onnote?.(buildNoteOnMessages(freq, wasActive));
	}
	function _releaseNote(midi) {
		activeKeys.delete(midi);
		if (activeKeys.size === 0) $$props.onnote?.([{
			param: "gate",
			value: 0
		}]);
	}
	triggerNote(_triggerNote);
	releaseNote(_releaseNote);
	function onKeyDown(e) {
		if (e.repeat) return;
		const midi = QWERTY_MAP[e.key];
		if (midi === void 0) return;
		if (pressedQwerty.has(e.key)) return;
		pressedQwerty.add(e.key);
		_triggerNote(midi);
	}
	function onKeyUp(e) {
		const midi = QWERTY_MAP[e.key];
		if (midi === void 0) return;
		pressedQwerty.delete(e.key);
		_releaseNote(midi);
	}
	onMount(() => {
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	});
	onDestroy(() => {
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
	});
	var div = root$6();
	var svg = child(div);
	set_attribute(svg, "height", WHITE_H + RAIL_H + 2);
	var rect = child(svg);
	set_attribute(rect, "x", 0);
	set_attribute(rect, "y", 0);
	set_attribute(rect, "height", RAIL_H);
	var node = sibling(rect);
	each(node, 17, () => get(whiteKeys), (key) => key.midi, ($$anchor, key) => {
		var rect_1 = root_1$1();
		set_attribute(rect_1, "y", RAIL_H);
		set_attribute(rect_1, "width", WHITE_W - 2);
		set_attribute(rect_1, "height", WHITE_H);
		let classes;
		template_effect(($0) => {
			set_attribute(rect_1, "x", get(key).x + 1);
			classes = set_class(rect_1, 0, "white-key svelte-1dlz8xf", null, classes, $0);
			set_attribute(rect_1, "data-midi", get(key).midi);
		}, [() => ({ active: activeKeys.has(get(key).midi) })]);
		delegated("pointerdown", rect_1, () => _triggerNote(get(key).midi));
		delegated("pointerup", rect_1, () => _releaseNote(get(key).midi));
		event("pointerleave", rect_1, () => _releaseNote(get(key).midi));
		append($$anchor, rect_1);
	});
	var node_1 = sibling(node);
	each(node_1, 17, () => get(keys).filter((k) => k.black), (key) => key.midi, ($$anchor, key) => {
		var rect_2 = root_2$1();
		set_attribute(rect_2, "y", RAIL_H);
		set_attribute(rect_2, "width", BLACK_W);
		set_attribute(rect_2, "height", BLACK_H);
		let classes_1;
		template_effect(($0) => {
			set_attribute(rect_2, "x", get(key).x);
			classes_1 = set_class(rect_2, 0, "black-key svelte-1dlz8xf", null, classes_1, $0);
			set_attribute(rect_2, "data-midi", get(key).midi);
		}, [() => ({ active: activeKeys.has(get(key).midi) })]);
		delegated("pointerdown", rect_2, () => _triggerNote(get(key).midi));
		delegated("pointerup", rect_2, () => _releaseNote(get(key).midi));
		event("pointerleave", rect_2, () => _releaseNote(get(key).midi));
		append($$anchor, rect_2);
	});
	var node_2 = sibling(node_1);
	each(node_2, 17, () => get(whiteKeys), (key) => key.midi, ($$anchor, key) => {
		var text = root_3();
		set_attribute(text, "y", RAIL_H + WHITE_H - 5);
		var text_1 = child(text, true);
		reset(text);
		template_effect(($0) => {
			set_attribute(text, "x", get(key).x + WHITE_W / 2);
			set_text(text_1, $0);
		}, [() => midiToNoteName(get(key).midi)]);
		append($$anchor, text);
	});
	each(sibling(node_2), 17, () => get(keys).filter((k) => k.black), (key) => key.midi, ($$anchor, key) => {
		var text_2 = root_4();
		set_attribute(text_2, "y", RAIL_H + BLACK_H - 4);
		var text_3 = child(text_2, true);
		reset(text_2);
		template_effect(($0) => {
			set_attribute(text_2, "x", get(key).x + BLACK_W / 2);
			set_text(text_3, $0);
		}, [() => midiToNoteName(get(key).midi)]);
		append($$anchor, text_2);
	});
	reset(svg);
	reset(div);
	template_effect(() => {
		set_attribute(svg, "width", get(totalWidth));
		set_attribute(rect, "width", get(totalWidth));
	});
	append($$anchor, div);
	pop();
}
delegate(["pointerdown", "pointerup"]);
//#endregion
//#region src/components/RegisterPanel.svelte
var root$5 = /* @__PURE__ */ from_html(`<div class="panel svelte-pygl9d"><span class="panel-label svelte-pygl9d">keyboard range</span> <div class="btn-col svelte-pygl9d"><button>Oct ▲</button> <button>Oct ▼</button></div></div>`);
function RegisterPanel($$anchor, $$props) {
	/** @type {{
	ondown?: () => void,
	onup?: () => void,
	activeRegister?: 'bottom' | 'top' | 'mid',
	}} */
	let activeRegister = prop($$props, "activeRegister", 3, "mid");
	var div = root$5();
	var div_1 = sibling(child(div), 2);
	var button = child(div_1);
	let classes;
	var button_1 = sibling(button, 2);
	let classes_1;
	reset(div_1);
	reset(div);
	template_effect(() => {
		classes = set_class(button, 1, "reg-btn svelte-pygl9d", null, classes, { active: activeRegister() === "top" });
		set_attribute(button, "aria-pressed", activeRegister() === "top");
		classes_1 = set_class(button_1, 1, "reg-btn svelte-pygl9d", null, classes_1, { active: activeRegister() === "bottom" });
		set_attribute(button_1, "aria-pressed", activeRegister() === "bottom");
	});
	delegated("click", button, function(...$$args) {
		$$props.onup?.apply(this, $$args);
	});
	delegated("click", button_1, function(...$$args) {
		$$props.ondown?.apply(this, $$args);
	});
	append($$anchor, div);
}
delegate(["click"]);
//#endregion
//#region src/components/WheelPanel.svelte
var root$4 = /* @__PURE__ */ from_html(`<div class="panel svelte-i6yfjl"><span class="panel-label svelte-i6yfjl">wheel</span> <div class="wheel-container svelte-i6yfjl"><div class="wheel-track svelte-i6yfjl" role="slider" aria-label="mod wheel"><div class="wheel-fill svelte-i6yfjl"></div></div></div></div>`);
function WheelPanel($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	externalValue?: number,
	onchange?: (e: { param: string, value: number }) => void,
	}} */
	let modWheel = /* @__PURE__ */ state(.5);
	user_effect(() => {
		if ($$props.externalValue !== void 0) set(modWheel, $$props.externalValue, true);
	});
	let wheelDragging = /* @__PURE__ */ state(false);
	let wheelStartY = 0;
	let wheelStartVal = 0;
	/** @param {PointerEvent & { currentTarget: Element }} e */
	function onWheelPointerDown(e) {
		set(wheelDragging, true);
		wheelStartY = e.clientY;
		wheelStartVal = get(modWheel);
		e.currentTarget.setPointerCapture(e.pointerId);
	}
	/** @param {PointerEvent} e */
	function onWheelPointerMove(e) {
		if (!get(wheelDragging)) return;
		const delta = (wheelStartY - e.clientY) / 80;
		set(modWheel, Math.max(0, Math.min(1, wheelStartVal + delta)), true);
		$$props.onchange?.({
			param: "modWheel",
			value: get(modWheel)
		});
	}
	function onWheelPointerUp() {
		set(wheelDragging, false);
	}
	/** @param {KeyboardEvent} e */
	function onWheelKeyDown(e) {
		const step = .05;
		if (e.key === "ArrowUp") {
			e.preventDefault();
			set(modWheel, Math.min(1, get(modWheel) + step), true);
			$$props.onchange?.({
				param: "modWheel",
				value: get(modWheel)
			});
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			set(modWheel, Math.max(0, get(modWheel) - step), true);
			$$props.onchange?.({
				param: "modWheel",
				value: get(modWheel)
			});
		} else if (e.key === "Home") {
			e.preventDefault();
			set(modWheel, 0);
			$$props.onchange?.({
				param: "modWheel",
				value: get(modWheel)
			});
		} else if (e.key === "End") {
			e.preventDefault();
			set(modWheel, 1);
			$$props.onchange?.({
				param: "modWheel",
				value: get(modWheel)
			});
		}
	}
	var div = root$4();
	var div_1 = sibling(child(div), 2);
	var div_2 = child(div_1);
	set_attribute(div_2, "tabindex", 0);
	set_attribute(div_2, "aria-valuemin", 0);
	set_attribute(div_2, "aria-valuemax", 1);
	var div_3 = child(div_2);
	reset(div_2);
	reset(div_1);
	reset(div);
	template_effect(() => {
		set_attribute(div_2, "aria-valuenow", get(modWheel));
		set_style(div_3, `height: ${get(modWheel) * 100}%`);
	});
	delegated("pointerdown", div_2, onWheelPointerDown);
	delegated("pointermove", div_2, onWheelPointerMove);
	delegated("pointerup", div_2, onWheelPointerUp);
	event("pointercancel", div_2, onWheelPointerUp);
	delegated("keydown", div_2, onWheelKeyDown);
	append($$anchor, div);
	pop();
}
delegate([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region src/components/PowerButton.svelte
var root$3 = /* @__PURE__ */ from_html(`<div class="power-wrap svelte-z2dg21"><button type="button"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke-linecap="round" stroke-width="2" aria-hidden="true"><line x1="10" y1="2" x2="10" y2="8"></line><path d="M 14.5 4.6 A 7 7 0 1 1 5.5 4.6"></path></svg></button></div>`);
function PowerButton($$anchor, $$props) {
	/** @type {{ powered: boolean, loading: boolean, ontoggle: () => void }} */
	let powered = prop($$props, "powered", 3, false), loading = prop($$props, "loading", 3, false);
	const status = /* @__PURE__ */ user_derived(() => loading() ? "loading" : powered() ? "on" : "off");
	var div = root$3();
	var button = child(div);
	let classes;
	var svg = child(button);
	reset(button);
	reset(div);
	template_effect(() => {
		classes = set_class(button, 1, "power-btn svelte-z2dg21", null, classes, { on: powered() });
		button.disabled = loading();
		set_attribute(button, "aria-pressed", powered());
		set_attribute(button, "aria-label", loading() ? "Starting audio" : powered() ? "Power off" : "Power on");
		set_class(svg, 0, `power-icon ${get(status) ?? ""}`, "svelte-z2dg21");
	});
	delegated("click", button, function(...$$args) {
		$$props.ontoggle?.apply(this, $$args);
	});
	append($$anchor, div);
}
delegate(["click"]);
//#endregion
//#region src/components/MidiStatus.svelte
var root_2 = /* @__PURE__ */ from_html(`<option> </option>`);
var root_1 = /* @__PURE__ */ from_html(`<select class="device-select svelte-1w0iv8d"></select>`);
var root$2 = /* @__PURE__ */ from_html(`<div class="midi-status svelte-1w0iv8d"><span></span> <span class="label svelte-1w0iv8d">MIDI</span> <!></div>`);
function MidiStatus($$anchor, $$props) {
	push($$props, true);
	/** @type {{
	status?: string,
	devices?: Array<{ id: string, name: string }>,
	selectedDeviceId?: string | null,
	ondevicechange?: (id: string) => void,
	}} */
	let status = prop($$props, "status", 3, "unavailable"), devices = prop($$props, "devices", 19, () => []), selectedDeviceId = prop($$props, "selectedDeviceId", 3, null);
	var div = root$2();
	var span = child(div);
	let classes;
	var node = sibling(span, 4);
	var consequent = ($$anchor) => {
		var select = root_1();
		each(select, 21, devices, (device) => device.id, ($$anchor, device) => {
			var option = root_2();
			var text = child(option, true);
			reset(option);
			var option_value = {};
			template_effect(() => {
				set_text(text, get(device).name);
				if (option_value !== (option_value = get(device).id)) option.value = (option.__value = get(device).id) ?? "";
			});
			append($$anchor, option);
		});
		reset(select);
		var select_value;
		init_select(select);
		template_effect(() => {
			if (select_value !== (select_value = selectedDeviceId())) select.value = (select.__value = selectedDeviceId()) ?? "", select_option(select, selectedDeviceId());
		});
		delegated("change", select, (e) => $$props.ondevicechange?.(e.currentTarget.value));
		append($$anchor, select);
	};
	if_block(node, ($$render) => {
		if (devices().length > 1) $$render(consequent);
	});
	reset(div);
	template_effect(() => classes = set_class(span, 1, "dot svelte-1w0iv8d", null, classes, {
		unavailable: status() === "unavailable",
		connected: status() === "connected",
		active: status() === "active"
	}));
	append($$anchor, div);
	pop();
}
delegate(["change"]);
//#endregion
//#region src/components/Scope.svelte
var root$1 = /* @__PURE__ */ from_html(`<div class="panel svelte-1pr5o9o"><span class="panel-label svelte-1pr5o9o">OSCILLOSCOPE</span> <div class="scope-body svelte-1pr5o9o"><canvas style="display: block; width: 100%; height: 80px; background: #1c1c1c;"></canvas></div></div>`);
function Scope($$anchor, $$props) {
	push($$props, true);
	/** @type {{ analyser: AnalyserNode | null, powered: boolean }} */
	let analyser = prop($$props, "analyser", 3, null), powered = prop($$props, "powered", 3, false);
	let canvas = /* @__PURE__ */ state(
		/** @type {HTMLCanvasElement | null} */
		null
	);
	let context = null;
	let frameId = 0;
	let mounted = false;
	let dataArray = null;
	function syncCanvasSize() {
		if (!get(canvas)) return;
		const width = get(canvas).clientWidth || 300;
		if (get(canvas).width !== width) get(canvas).width = width;
		if (get(canvas).height !== 80) get(canvas).height = 80;
	}
	function drawMidline() {
		if (!get(canvas) || !context) return;
		syncCanvasSize();
		context.clearRect(0, 0, get(canvas).width, get(canvas).height);
		context.strokeStyle = "#e8dcc8";
		context.lineWidth = 2;
		context.beginPath();
		context.moveTo(0, get(canvas).height / 2);
		context.lineTo(get(canvas).width, get(canvas).height / 2);
		context.stroke();
	}
	function drawWaveform() {
		if (!get(canvas) || !context || !analyser()) return;
		syncCanvasSize();
		const bufferLength = analyser().fftSize / 2;
		if (!dataArray || dataArray.length !== bufferLength) dataArray = new Uint8Array(bufferLength);
		analyser().getByteTimeDomainData(dataArray);
		context.clearRect(0, 0, get(canvas).width, get(canvas).height);
		context.strokeStyle = "#e8dcc8";
		context.lineWidth = 2;
		context.beginPath();
		for (let index = 0; index < dataArray.length; index += 1) {
			const x = index / (dataArray.length - 1) * get(canvas).width;
			const y = dataArray[index] / 128 * (get(canvas).height / 2);
			if (index === 0) context.moveTo(x, y);
			else context.lineTo(x, y);
		}
		context.stroke();
	}
	function stopAnimation() {
		if (frameId) {
			cancelAnimationFrame(frameId);
			frameId = 0;
		}
	}
	function tick() {
		if (!powered() || !analyser()) {
			frameId = 0;
			drawMidline();
			return;
		}
		drawWaveform();
		frameId = requestAnimationFrame(tick);
	}
	function startAnimation() {
		if (frameId || !powered() || !analyser()) return;
		frameId = requestAnimationFrame(tick);
	}
	function syncAnimation() {
		if (!mounted) return;
		if (powered() && analyser()) {
			startAnimation();
			return;
		}
		stopAnimation();
		drawMidline();
	}
	onMount(() => {
		context = get(canvas)?.getContext("2d") ?? null;
		mounted = true;
		drawMidline();
		syncAnimation();
	});
	onDestroy(() => {
		stopAnimation();
	});
	user_effect(() => {
		powered();
		analyser();
		syncAnimation();
	});
	var div = root$1();
	var div_1 = sibling(child(div), 2);
	bind_this(child(div_1), ($$value) => set(canvas, $$value), () => get(canvas));
	reset(div_1);
	reset(div);
	append($$anchor, div);
	pop();
}
//#endregion
//#region src/App.svelte
var KNOB_PARAMS = {
	osc2Detune: {
		min: -100,
		max: 100
	},
	osc3Detune: {
		min: -100,
		max: 100
	},
	osc3LfoRate: {
		min: .1,
		max: 20
	},
	osc1Level: {
		min: 0,
		max: 1
	},
	osc2Level: {
		min: 0,
		max: 1
	},
	osc3Level: {
		min: 0,
		max: 1
	},
	noiseLevel: {
		min: 0,
		max: 1
	},
	cutoff: {
		min: 20,
		max: 2e4
	},
	resonance: {
		min: 0,
		max: 1
	},
	keyTrack: {
		min: 0,
		max: 1
	},
	filterAttack: {
		min: .001,
		max: 4
	},
	filterDecay: {
		min: .001,
		max: 4
	},
	filterSustain: {
		min: 0,
		max: 1
	},
	filterRelease: {
		min: .001,
		max: 8
	},
	filterEnvAmt: {
		min: 0,
		max: 1e4
	},
	ampAttack: {
		min: .001,
		max: 4
	},
	ampDecay: {
		min: .001,
		max: 4
	},
	ampSustain: {
		min: 0,
		max: 1
	},
	ampRelease: {
		min: .001,
		max: 8
	},
	modMix: {
		min: 0,
		max: 1
	},
	modWheel: {
		min: 0,
		max: 1
	},
	glideRate: {
		min: .001,
		max: 5
	},
	delayTime: {
		min: .01,
		max: 2
	},
	delayFeedback: {
		min: 0,
		max: .9
	},
	delayMix: {
		min: 0,
		max: 1
	},
	delayModRate: {
		min: .1,
		max: 10
	},
	delayModDepth: {
		min: 0,
		max: .025
	},
	reverbSend: {
		min: 0,
		max: 1
	},
	reverbDecay: {
		min: .01,
		max: 1
	},
	reverbDamp: {
		min: 0,
		max: 1
	},
	reverbPreDelay: {
		min: 0,
		max: .1
	},
	masterVol: {
		min: 0,
		max: 1
	}
};
var BIPOLAR_PARAMS = new Set([
	"osc2Detune",
	"osc3Detune",
	"modMix"
]);
function powerOffValue(p) {
	return BIPOLAR_PARAMS.has(p) ? (KNOB_PARAMS[p].min + KNOB_PARAMS[p].max) / 2 : KNOB_PARAMS[p].min;
}
var root = /* @__PURE__ */ from_html(`<div class="app svelte-1n46o8q"><header class="header svelte-1n46o8q"><a class="github-link svelte-1n46o8q" href="https://github.com/davidirvine/synth-d" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg></a> <div class="title-block svelte-1n46o8q"><span class="title svelte-1n46o8q">SYNTH-D</span> <span class="version-label svelte-1n46o8q"> </span></div> <div class="header-right svelte-1n46o8q"><!> <!></div></header> <main class="svelte-1n46o8q"><div><div class="panels svelte-1n46o8q"><!> <!> <div class="filter-output-grid svelte-1n46o8q"><!> <!> <div class="effects-col svelte-1n46o8q"><!></div> <div class="panel-row svelte-1n46o8q"><!> <!></div> <!></div></div> <div class="keyboard-row svelte-1n46o8q"><!> <!> <!></div></div></main></div>`);
function App($$anchor, $$props) {
	push($$props, true);
	const branch = "main";
	const versionLabel = branch === "main" ? `v1.4.0` : `v1.4.0 (${branch})`;
	const DEFAULTS = {
		osc2Detune: 0,
		osc3Detune: 0,
		osc3LfoRate: 1,
		osc1Level: .75,
		osc2Level: 0,
		osc3Level: 0,
		noiseLevel: 0,
		cutoff: 2e3,
		resonance: .3,
		filterAttack: .01,
		filterDecay: .3,
		filterSustain: .5,
		filterRelease: .3,
		filterEnvAmt: 0,
		ampAttack: .01,
		ampDecay: .5,
		ampSustain: .7,
		ampRelease: .3,
		masterVol: .75,
		modMix: 0,
		modWheel: .5,
		glideRate: .2,
		delayTime: .3,
		delayFeedback: .3,
		delayMix: .3,
		delayModRate: .5,
		delayModDepth: 0,
		reverbSend: .3,
		reverbDamp: .5,
		reverbDecay: .5,
		reverbPreDelay: .015
	};
	let keyboardBase = /* @__PURE__ */ state(36);
	const activeRegister = /* @__PURE__ */ user_derived(() => get(keyboardBase) === 21 ? "bottom" : get(keyboardBase) === 48 ? "top" : "mid");
	let powered = /* @__PURE__ */ state(false);
	let loading = /* @__PURE__ */ state(false);
	let analyser = /* @__PURE__ */ state(
		/** @type {AnalyserNode | null} */
		null
	);
	let resetCounter = /* @__PURE__ */ state(0);
	let midiStatus = /* @__PURE__ */ state(
		/** @type {'unavailable'|'connected'|'active'} */
		"unavailable"
	);
	let midiDevices = /* @__PURE__ */ state(proxy(
		/** @type {Array<{id:string,name:string}>} */
		[]
	));
	let selectedDeviceId = /* @__PURE__ */ state(
		/** @type {string|null} */
		null
	);
	let learningParam = /* @__PURE__ */ state(
		/** @type {string|null} */
		null
	);
	let midiActiveNotes = /* @__PURE__ */ state(0);
	let ccExternalValues = /* @__PURE__ */ state(proxy(
		/** @type {Record<string,number|undefined>} */
		Object.fromEntries(Object.keys(DEFAULTS).map((p) => [p, powerOffValue(p)]))
	));
	const midiCcMap = new MidiCcMap();
	const midiManager = new MidiManager({
		onNoteOn: (note, freq) => {
			update(midiActiveNotes);
			if (get(midiStatus) === "connected") set(midiStatus, "active");
			get(keyboardTriggerNote)?.(note);
			setParam("freq", freq);
		},
		onNoteOff: (note) => {
			set(midiActiveNotes, Math.max(0, get(midiActiveNotes) - 1), true);
			if (get(midiActiveNotes) === 0 && get(midiStatus) === "active") set(midiStatus, "connected");
			get(keyboardReleaseNote)?.(note);
		},
		onPitchBend: (freq) => {
			setParam("freq", freq);
		},
		onCc: ({ cc, value }) => {
			if (get(learningParam) !== null) {
				const knob = KNOB_PARAMS[get(learningParam)];
				if (knob) {
					midiCcMap.assign(cc, get(learningParam), knob.min, knob.max);
					set(learningParam, null);
					return;
				}
			}
			if (cc === 1) {
				const scaled = value / 127;
				set(ccExternalValues, {
					...get(ccExternalValues),
					modWheel: scaled
				}, true);
				setParam("modWheel", scaled);
				return;
			}
			const mapping = midiCcMap.resolve(cc);
			if (!mapping) return;
			const scaled = midiCcMap.scale(cc, value);
			if (scaled === null) return;
			set(ccExternalValues, {
				...get(ccExternalValues),
				[mapping.param]: scaled
			}, true);
		},
		onStatusChange: (status) => {
			set(midiStatus, status, true);
		},
		onDevicesChange: (devices) => {
			set(midiDevices, devices, true);
			if (devices.length > 0 && get(selectedDeviceId) === null) set(selectedDeviceId, devices[0].id, true);
		}
	});
	let keyboardTriggerNote = /* @__PURE__ */ state(
		/** @type {((midi: number) => void) | null} */
		null
	);
	let keyboardReleaseNote = /* @__PURE__ */ state(
		/** @type {((midi: number) => void) | null} */
		null
	);
	async function handleToggle() {
		if (get(powered)) {
			midiManager.destroy();
			await powerOff();
			set(powered, false);
			set(midiStatus, "unavailable");
			set(ccExternalValues, Object.fromEntries(Object.keys(DEFAULTS).map((p) => [p, powerOffValue(p)])), true);
		} else {
			set(loading, true);
			try {
				await powerOn();
				set(analyser, getAnalyser(), true);
				set(powered, true);
				set(ccExternalValues, { ...DEFAULTS }, true);
				update(resetCounter);
				await midiManager.connect();
			} catch (err) {
				console.error("Power on failed:", err);
			} finally {
				set(loading, false);
			}
		}
	}
	/** @param {{ param: string, value: number }} e */
	function onParamChange(e) {
		setParam(e.param, e.value);
		if (e.param in get(ccExternalValues) && get(ccExternalValues)[e.param] !== e.value) set(ccExternalValues, {
			...get(ccExternalValues),
			[e.param]: e.value
		}, true);
	}
	/** @param {Array<{ param: string, value: number }>} messages */
	function onKeyboardNote(messages) {
		for (const msg of messages) setParam(msg.param, msg.value);
	}
	/** @param {string} param */
	function onKnobContextMenu(param) {
		set(learningParam, get(learningParam) === param ? null : param, true);
	}
	/** @param {KeyboardEvent} e */
	function onKeyDown(e) {
		if (e.key === "Escape" && get(learningParam) !== null) set(learningParam, null);
	}
	onMount(() => window.addEventListener("keydown", onKeyDown));
	onDestroy(() => {
		window.removeEventListener("keydown", onKeyDown);
		midiManager.destroy();
	});
	/** @param {...string} params */
	function midiStateFor(...params) {
		return Object.fromEntries(params.map((p) => [p, {
			externalValue: get(ccExternalValues)[p],
			learningMidi: get(learningParam) === p,
			assignedCc: midiCcMap.getAssignedCc(p)
		}]));
	}
	let oscMidiState = /* @__PURE__ */ user_derived(() => midiStateFor("osc2Detune", "osc3Detune", "osc3LfoRate"));
	let mixerMidiState = /* @__PURE__ */ user_derived(() => midiStateFor("osc1Level", "osc2Level", "osc3Level", "noiseLevel"));
	let filterMidiState = /* @__PURE__ */ user_derived(() => midiStateFor("cutoff", "resonance", "keyTrack", "filterAttack", "filterDecay", "filterSustain", "filterRelease", "filterEnvAmt"));
	let ampEnvMidiState = /* @__PURE__ */ user_derived(() => midiStateFor("ampAttack", "ampDecay", "ampSustain", "ampRelease", "masterVol"));
	let modMidiState = /* @__PURE__ */ user_derived(() => midiStateFor("modMix"));
	let glideMidiState = /* @__PURE__ */ user_derived(() => midiStateFor("glideRate"));
	let effectsMidiState = /* @__PURE__ */ user_derived(() => midiStateFor("reverbSend", "reverbDamp", "reverbDecay", "reverbPreDelay", "delayTime", "delayFeedback", "delayMix", "delayModRate", "delayModDepth"));
	var div = root();
	var header = child(div);
	var div_1 = sibling(child(header), 2);
	var span = sibling(child(div_1), 2);
	var text = child(span, true);
	reset(span);
	reset(div_1);
	var div_2 = sibling(div_1, 2);
	var node = child(div_2);
	MidiStatus(node, {
		get status() {
			return get(midiStatus);
		},
		get devices() {
			return get(midiDevices);
		},
		get selectedDeviceId() {
			return get(selectedDeviceId);
		},
		ondevicechange: (id) => {
			set(selectedDeviceId, id, true);
			midiManager.selectDevice(id);
		}
	});
	PowerButton(sibling(node, 2), {
		get powered() {
			return get(powered);
		},
		get loading() {
			return get(loading);
		},
		ontoggle: handleToggle
	});
	reset(div_2);
	reset(header);
	var main = sibling(header, 2);
	var div_3 = child(main);
	let classes;
	var div_4 = child(div_3);
	var node_2 = child(div_4);
	Oscillator(node_2, {
		onchange: onParamChange,
		get midiState() {
			return get(oscMidiState);
		},
		onknobcontextmenu: onKnobContextMenu,
		get reset() {
			return get(resetCounter);
		}
	});
	var node_3 = sibling(node_2, 2);
	Mixer(node_3, {
		onchange: onParamChange,
		get midiState() {
			return get(mixerMidiState);
		},
		onknobcontextmenu: onKnobContextMenu,
		get reset() {
			return get(resetCounter);
		},
		get getPeak() {
			return getMixerPeak;
		},
		get powered() {
			return get(powered);
		}
	});
	var div_5 = sibling(node_3, 2);
	var node_4 = child(div_5);
	Filter(node_4, {
		onchange: onParamChange,
		get midiState() {
			return get(filterMidiState);
		},
		onknobcontextmenu: onKnobContextMenu,
		get reset() {
			return get(resetCounter);
		}
	});
	var node_5 = sibling(node_4, 2);
	AmpEnv(node_5, {
		onchange: onParamChange,
		get midiState() {
			return get(ampEnvMidiState);
		},
		onknobcontextmenu: onKnobContextMenu,
		get reset() {
			return get(resetCounter);
		},
		get getOutputPeak() {
			return getOutputPeak;
		},
		get powered() {
			return get(powered);
		}
	});
	var div_6 = sibling(node_5, 2);
	Effects(child(div_6), {
		onchange: onParamChange,
		get midiState() {
			return get(effectsMidiState);
		},
		onknobcontextmenu: onKnobContextMenu,
		get reset() {
			return get(resetCounter);
		}
	});
	reset(div_6);
	var div_7 = sibling(div_6, 2);
	var node_7 = child(div_7);
	Modulation(node_7, {
		onchange: onParamChange,
		get midiState() {
			return get(modMidiState);
		},
		onknobcontextmenu: onKnobContextMenu,
		get reset() {
			return get(resetCounter);
		}
	});
	Glide(sibling(node_7, 2), {
		onchange: onParamChange,
		get midiState() {
			return get(glideMidiState);
		},
		onknobcontextmenu: onKnobContextMenu,
		get reset() {
			return get(resetCounter);
		}
	});
	reset(div_7);
	Scope(sibling(div_7, 2), {
		get analyser() {
			return get(analyser);
		},
		get powered() {
			return get(powered);
		}
	});
	reset(div_5);
	reset(div_4);
	var div_8 = sibling(div_4, 2);
	var node_10 = child(div_8);
	WheelPanel(node_10, {
		get externalValue() {
			return get(ccExternalValues).modWheel;
		},
		onchange: onParamChange
	});
	var node_11 = sibling(node_10, 2);
	Keyboard(node_11, {
		onnote: onKeyboardNote,
		get baseMidi() {
			return get(keyboardBase);
		},
		get triggerNote() {
			return get(keyboardTriggerNote);
		},
		set triggerNote($$value) {
			set(keyboardTriggerNote, $$value, true);
		},
		get releaseNote() {
			return get(keyboardReleaseNote);
		},
		set releaseNote($$value) {
			set(keyboardReleaseNote, $$value, true);
		}
	});
	RegisterPanel(sibling(node_11, 2), {
		ondown: () => set(keyboardBase, 21),
		onup: () => set(keyboardBase, 48),
		get activeRegister() {
			return get(activeRegister);
		}
	});
	reset(div_8);
	reset(div_3);
	reset(main);
	reset(div);
	template_effect(() => {
		set_text(text, versionLabel);
		main.inert = !get(powered) || void 0;
		classes = set_class(div_3, 1, "synth svelte-1n46o8q", null, classes, { dimmed: !get(powered) });
	});
	append($$anchor, div);
	pop();
}
mount(App, { target: document.getElementById("app") });
//#endregion
