
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.59.1 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (267:0) {:else}
    function create_else_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(267:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (260:0) {#if componentParams}
    function create_if_block$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(260:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    function restoreScroll(state) {
    	// If this exists, then this is a back navigation: restore the scroll position
    	if (state) {
    		window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
    	} else {
    		// Otherwise this is a forward navigation: scroll to top
    		window.scrollTo(0, 0);
    	}
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			restoreScroll(previousScrollState);
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		restoreScroll,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-icons\components\IconBase.svelte generated by Svelte v3.59.1 */

    const file$k = "node_modules\\svelte-icons\\components\\IconBase.svelte";

    // (18:2) {#if title}
    function create_if_block$2(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[0]);
    			add_location(title_1, file$k, 18, 4, 298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(18:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let svg;
    	let if_block_anchor;
    	let current;
    	let if_block = /*title*/ ctx[0] && create_if_block$2(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			attr_dev(svg, "class", "svelte-c8tyih");
    			add_location(svg, file$k, 16, 0, 229);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(svg, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*viewBox*/ 2) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('IconBase', slots, ['default']);
    	let { title = null } = $$props;
    	let { viewBox } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (viewBox === undefined && !('viewBox' in $$props || $$self.$$.bound[$$self.$$.props['viewBox']])) {
    			console.warn("<IconBase> was created without expected prop 'viewBox'");
    		}
    	});

    	const writable_props = ['title', 'viewBox'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('viewBox' in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, viewBox });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('viewBox' in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, viewBox, $$scope, slots];
    }

    class IconBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { title: 0, viewBox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconBase",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get title() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-icons\fa\FaFacebook.svelte generated by Svelte v3.59.1 */
    const file$j = "node_modules\\svelte-icons\\fa\\FaFacebook.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$7(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z");
    			add_location(path, file$j, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$7] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FaFacebook', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaFacebook extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaFacebook",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaInstagram.svelte generated by Svelte v3.59.1 */
    const file$i = "node_modules\\svelte-icons\\fa\\FaInstagram.svelte";

    // (4:8) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$6(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z");
    			add_location(path, file$i, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FaInstagram', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaInstagram extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaInstagram",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaLinkedin.svelte generated by Svelte v3.59.1 */
    const file$h = "node_modules\\svelte-icons\\fa\\FaLinkedin.svelte";

    // (4:8) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z");
    			add_location(path, file$h, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FaLinkedin', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaLinkedin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaLinkedin",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaArrowRight.svelte generated by Svelte v3.59.1 */
    const file$g = "node_modules\\svelte-icons\\fa\\FaArrowRight.svelte";

    // (4:8) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z");
    			add_location(path, file$g, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FaArrowRight', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaArrowRight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaArrowRight",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaCalendar.svelte generated by Svelte v3.59.1 */
    const file$f = "node_modules\\svelte-icons\\fa\\FaCalendar.svelte";

    // (4:8) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm436-44v-36c0-26.5-21.5-48-48-48h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v36c0 6.6 5.4 12 12 12h424c6.6 0 12-5.4 12-12z");
    			add_location(path, file$f, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FaCalendar', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaCalendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaCalendar",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaEnvelope.svelte generated by Svelte v3.59.1 */
    const file$e = "node_modules\\svelte-icons\\fa\\FaEnvelope.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z");
    			add_location(path, file$e, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FaEnvelope', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaEnvelope extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaEnvelope",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaLandmark.svelte generated by Svelte v3.59.1 */
    const file$d = "node_modules\\svelte-icons\\fa\\FaLandmark.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M501.62 92.11L267.24 2.04a31.958 31.958 0 0 0-22.47 0L10.38 92.11A16.001 16.001 0 0 0 0 107.09V144c0 8.84 7.16 16 16 16h480c8.84 0 16-7.16 16-16v-36.91c0-6.67-4.14-12.64-10.38-14.98zM64 192v160H48c-8.84 0-16 7.16-16 16v48h448v-48c0-8.84-7.16-16-16-16h-16V192h-64v160h-96V192h-64v160h-96V192H64zm432 256H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h480c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z");
    			add_location(path, file$d, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FaLandmark', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaLandmark extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaLandmark",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* node_modules\svelte-icons\fa\FaPhone.svelte generated by Svelte v3.59.1 */
    const file$c = "node_modules\\svelte-icons\\fa\\FaPhone.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z");
    			add_location(path, file$c, 4, 10, 153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FaPhone', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaPhone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaPhone",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut, axis = 'y' } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const primary_property = axis === 'y' ? 'height' : 'width';
        const primary_property_value = parseFloat(style[primary_property]);
        const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
        const capitalized_secondary_properties = secondary_properties.map((e) => `${e[0].toUpperCase()}${e.slice(1)}`);
        const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
        const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
        const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
        const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
        const border_width_start_value = parseFloat(style[`border${capitalized_secondary_properties[0]}Width`]);
        const border_width_end_value = parseFloat(style[`border${capitalized_secondary_properties[1]}Width`]);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `${primary_property}: ${t * primary_property_value}px;` +
                `padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
                `padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
                `margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
                `margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
                `border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
                `border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
        };
    }

    /* src\components\Home.svelte generated by Svelte v3.59.1 */
    const file$b = "src\\components\\Home.svelte";

    function create_fragment$b(ctx) {
    	let div16;
    	let div8;
    	let div7;
    	let div0;
    	let h2;
    	let t0;
    	let span0;
    	let t2;
    	let div1;
    	let p0;
    	let span1;
    	let t5;
    	let span2;
    	let t7;
    	let div2;
    	let button;
    	let t9;
    	let div6;
    	let div5;
    	let div3;
    	let faphone;
    	let t10;
    	let p1;
    	let t12;
    	let div4;
    	let faenvelope;
    	let t13;
    	let p2;
    	let div8_transition;
    	let t15;
    	let div10;
    	let div9;
    	let img;
    	let img_src_value;
    	let div9_transition;
    	let t16;
    	let div15;
    	let div14;
    	let a0;
    	let div11;
    	let falinkedin;
    	let t17;
    	let a1;
    	let div12;
    	let fainstagram;
    	let t18;
    	let a2;
    	let div13;
    	let fafacebook;
    	let t19;
    	let hr;
    	let current;
    	faphone = new FaPhone({ props: { size: 20 }, $$inline: true });
    	faenvelope = new FaEnvelope({ props: { size: 24 }, $$inline: true });
    	falinkedin = new FaLinkedin({ props: { size: 20 }, $$inline: true });
    	fainstagram = new FaInstagram({ props: { size: 20 }, $$inline: true });
    	fafacebook = new FaFacebook({ props: { size: 20 }, $$inline: true });

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text("MY NAME IS ");
    			span0 = element("span");
    			span0.textContent = `${/*name*/ ctx[0]}`;
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			span1 = element("span");
    			span1.textContent = `${/*role*/ ctx[1]}  `;
    			t5 = text("based in ");
    			span2 = element("span");
    			span2.textContent = `${/*location*/ ctx[2]}`;
    			t7 = space();
    			div2 = element("div");
    			button = element("button");
    			button.textContent = "Let's talk with me";
    			t9 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			create_component(faphone.$$.fragment);
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = `${/*mobile*/ ctx[3]}`;
    			t12 = space();
    			div4 = element("div");
    			create_component(faenvelope.$$.fragment);
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = `${/*mail*/ ctx[4]}`;
    			t15 = space();
    			div10 = element("div");
    			div9 = element("div");
    			img = element("img");
    			t16 = space();
    			div15 = element("div");
    			div14 = element("div");
    			a0 = element("a");
    			div11 = element("div");
    			create_component(falinkedin.$$.fragment);
    			t17 = space();
    			a1 = element("a");
    			div12 = element("div");
    			create_component(fainstagram.$$.fragment);
    			t18 = space();
    			a2 = element("a");
    			div13 = element("div");
    			create_component(fafacebook.$$.fragment);
    			t19 = space();
    			hr = element("hr");
    			attr_dev(span0, "class", "name svelte-dfcbag");
    			add_location(span0, file$b, 14, 31, 559);
    			attr_dev(h2, "class", "svelte-dfcbag");
    			add_location(h2, file$b, 14, 16, 544);
    			attr_dev(div0, "class", "user-bio");
    			add_location(div0, file$b, 13, 12, 504);
    			attr_dev(span1, "class", "loc svelte-dfcbag");
    			add_location(span1, file$b, 17, 19, 669);
    			attr_dev(span2, "class", "loc svelte-dfcbag");
    			add_location(span2, file$b, 17, 60, 710);
    			add_location(p0, file$b, 17, 16, 666);
    			attr_dev(div1, "class", "role svelte-dfcbag");
    			add_location(div1, file$b, 16, 12, 630);
    			attr_dev(button, "class", "btn svelte-dfcbag");
    			add_location(button, file$b, 20, 16, 819);
    			attr_dev(div2, "class", "btns");
    			add_location(div2, file$b, 19, 12, 783);
    			attr_dev(div3, "class", "phone-icon svelte-dfcbag");
    			add_location(div3, file$b, 24, 20, 981);
    			attr_dev(p1, "class", "svelte-dfcbag");
    			add_location(p1, file$b, 25, 20, 1053);
    			attr_dev(div4, "class", "mail-icon svelte-dfcbag");
    			add_location(div4, file$b, 26, 20, 1090);
    			attr_dev(p2, "class", "svelte-dfcbag");
    			add_location(p2, file$b, 27, 20, 1164);
    			attr_dev(div5, "class", "mobile svelte-dfcbag");
    			add_location(div5, file$b, 23, 16, 939);
    			attr_dev(div6, "class", "contact svelte-dfcbag");
    			add_location(div6, file$b, 22, 12, 900);
    			attr_dev(div7, "class", "box svelte-dfcbag");
    			add_location(div7, file$b, 12, 8, 473);
    			attr_dev(div8, "class", "content svelte-dfcbag");
    			add_location(div8, file$b, 11, 4, 418);
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[5])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "userimage");
    			attr_dev(img, "class", "svelte-dfcbag");
    			add_location(img, file$b, 34, 12, 1344);
    			attr_dev(div9, "class", "img svelte-dfcbag");
    			add_location(div9, file$b, 33, 8, 1283);
    			attr_dev(div10, "class", "user svelte-dfcbag");
    			add_location(div10, file$b, 32, 4, 1255);
    			attr_dev(div11, "class", "icon svelte-dfcbag");
    			add_location(div11, file$b, 39, 75, 1544);
    			attr_dev(a0, "href", "https://www.linkedin.com/in/ramesh-kannan-247076170/");
    			add_location(a0, file$b, 39, 12, 1481);
    			attr_dev(div12, "class", "icon svelte-dfcbag");
    			add_location(div12, file$b, 40, 67, 1666);
    			attr_dev(a1, "href", "https://www.instagram.com/nrk_kannan_ramesh/");
    			add_location(a1, file$b, 40, 12, 1611);
    			attr_dev(div13, "class", "icon svelte-dfcbag");
    			add_location(div13, file$b, 41, 26, 1747);
    			attr_dev(a2, "href", "#hh");
    			add_location(a2, file$b, 41, 12, 1733);
    			attr_dev(hr, "class", "svelte-dfcbag");
    			add_location(hr, file$b, 42, 12, 1813);
    			attr_dev(div14, "class", "social-media svelte-dfcbag");
    			add_location(div14, file$b, 38, 8, 1441);
    			attr_dev(div15, "class", "social svelte-dfcbag");
    			add_location(div15, file$b, 37, 4, 1411);
    			attr_dev(div16, "class", "home-page svelte-dfcbag");
    			add_location(div16, file$b, 10, 0, 389);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(h2, span0);
    			append_dev(div7, t2);
    			append_dev(div7, div1);
    			append_dev(div1, p0);
    			append_dev(p0, span1);
    			append_dev(p0, t5);
    			append_dev(p0, span2);
    			append_dev(div7, t7);
    			append_dev(div7, div2);
    			append_dev(div2, button);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			mount_component(faphone, div3, null);
    			append_dev(div5, t10);
    			append_dev(div5, p1);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			mount_component(faenvelope, div4, null);
    			append_dev(div5, t13);
    			append_dev(div5, p2);
    			append_dev(div16, t15);
    			append_dev(div16, div10);
    			append_dev(div10, div9);
    			append_dev(div9, img);
    			append_dev(div16, t16);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, a0);
    			append_dev(a0, div11);
    			mount_component(falinkedin, div11, null);
    			append_dev(div14, t17);
    			append_dev(div14, a1);
    			append_dev(a1, div12);
    			mount_component(fainstagram, div12, null);
    			append_dev(div14, t18);
    			append_dev(div14, a2);
    			append_dev(a2, div13);
    			mount_component(fafacebook, div13, null);
    			append_dev(div14, t19);
    			append_dev(div14, hr);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faphone.$$.fragment, local);
    			transition_in(faenvelope.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!current) return;
    					if (!div8_transition) div8_transition = create_bidirectional_transition(div8, slide, {}, true);
    					div8_transition.run(1);
    				});
    			}

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div9_transition) div9_transition = create_bidirectional_transition(div9, fly, { y: 200 }, true);
    				div9_transition.run(1);
    			});

    			transition_in(falinkedin.$$.fragment, local);
    			transition_in(fainstagram.$$.fragment, local);
    			transition_in(fafacebook.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faphone.$$.fragment, local);
    			transition_out(faenvelope.$$.fragment, local);

    			if (local) {
    				if (!div8_transition) div8_transition = create_bidirectional_transition(div8, slide, {}, false);
    				div8_transition.run(0);
    			}

    			if (!div9_transition) div9_transition = create_bidirectional_transition(div9, fly, { y: 200 }, false);
    			div9_transition.run(0);
    			transition_out(falinkedin.$$.fragment, local);
    			transition_out(fainstagram.$$.fragment, local);
    			transition_out(fafacebook.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			destroy_component(faphone);
    			destroy_component(faenvelope);
    			if (detaching && div8_transition) div8_transition.end();
    			if (detaching && div9_transition) div9_transition.end();
    			destroy_component(falinkedin);
    			destroy_component(fainstagram);
    			destroy_component(fafacebook);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let name = "Ramesh kannan...";
    	let role = "Software Developer";
    	let location = "Tamil Nadu";
    	let mobile = "8825681631";
    	let mail = "nrkannann@gmail.com";
    	let src = '../images/user.png';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		FaLinkedin,
    		FaInstagram,
    		FaFacebook,
    		FaPhone,
    		FaEnvelope,
    		slide,
    		fade,
    		fly,
    		name,
    		role,
    		location,
    		mobile,
    		mail,
    		src
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('role' in $$props) $$invalidate(1, role = $$props.role);
    		if ('location' in $$props) $$invalidate(2, location = $$props.location);
    		if ('mobile' in $$props) $$invalidate(3, mobile = $$props.mobile);
    		if ('mail' in $$props) $$invalidate(4, mail = $$props.mail);
    		if ('src' in $$props) $$invalidate(5, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, role, location, mobile, mail, src];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\about\UserDetail.svelte generated by Svelte v3.59.1 */
    const file$a = "src\\components\\about\\UserDetail.svelte";

    function create_fragment$a(ctx) {
    	let div19;
    	let div18;
    	let div4;
    	let div1;
    	let div0;
    	let faphone;
    	let t0;
    	let p0;
    	let t1;
    	let t2;
    	let div3;
    	let div2;
    	let facalendar;
    	let t3;
    	let p1;
    	let t5;
    	let div9;
    	let div6;
    	let div5;
    	let faenvelope;
    	let t6;
    	let p2;
    	let t7;
    	let t8;
    	let div8;
    	let div7;
    	let falandmark;
    	let t9;
    	let p3;
    	let t10;
    	let t11;
    	let hr;
    	let t12;
    	let div16;
    	let div12;
    	let div10;
    	let h10;
    	let t14;
    	let p4;
    	let t16;
    	let div11;
    	let p5;
    	let t17;
    	let span;
    	let t18;
    	let t19;
    	let t20;
    	let div15;
    	let div13;
    	let h11;
    	let t22;
    	let p6;
    	let t24;
    	let div14;
    	let p7;
    	let t26;
    	let div17;
    	let p8;
    	let current;
    	faphone = new FaPhone({ props: { size: 20 }, $$inline: true });
    	facalendar = new FaCalendar({ props: { size: 20 }, $$inline: true });
    	faenvelope = new FaEnvelope({ props: { size: 20 }, $$inline: true });
    	falandmark = new FaLandmark({ props: { size: 20 }, $$inline: true });

    	const block = {
    		c: function create() {
    			div19 = element("div");
    			div18 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(faphone.$$.fragment);
    			t0 = space();
    			p0 = element("p");
    			t1 = text(/*mobile*/ ctx[1]);
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(facalendar.$$.fragment);
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "1 yrs";
    			t5 = space();
    			div9 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			create_component(faenvelope.$$.fragment);
    			t6 = space();
    			p2 = element("p");
    			t7 = text(/*mail*/ ctx[0]);
    			t8 = space();
    			div8 = element("div");
    			div7 = element("div");
    			create_component(falandmark.$$.fragment);
    			t9 = space();
    			p3 = element("p");
    			t10 = text(/*location*/ ctx[2]);
    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			div16 = element("div");
    			div12 = element("div");
    			div10 = element("div");
    			h10 = element("h1");
    			h10.textContent = "1+";
    			t14 = space();
    			p4 = element("p");
    			p4.textContent = "Years experience";
    			t16 = space();
    			div11 = element("div");
    			p5 = element("p");
    			t17 = text("Hello there! My name is ");
    			span = element("span");
    			t18 = text(/*name*/ ctx[3]);
    			t19 = text(".I am a web designer & developer, and I'm very passionate and dedicated to my work.");
    			t20 = space();
    			div15 = element("div");
    			div13 = element("div");
    			h11 = element("h1");
    			h11.textContent = "1";
    			t22 = space();
    			p6 = element("p");
    			p6.textContent = "clients worldwide";
    			t24 = space();
    			div14 = element("div");
    			p7 = element("p");
    			p7.textContent = "With 1+ years experience as a professional a graphic designer,I have acquired the skills and knowledge necessary to make your project a sucess.";
    			t26 = space();
    			div17 = element("div");
    			p8 = element("p");
    			p8.textContent = "“A person who is happy is not because everything is right in his life, He is happy because his attitude towards everything in his life is right.”";
    			attr_dev(div0, "class", "icon svelte-olj37h");
    			add_location(div0, file$a, 14, 16, 439);
    			attr_dev(p0, "class", "svelte-olj37h");
    			add_location(p0, file$a, 15, 16, 501);
    			attr_dev(div1, "class", "mobile svelte-olj37h");
    			add_location(div1, file$a, 13, 12, 401);
    			attr_dev(div2, "class", "icon svelte-olj37h");
    			add_location(div2, file$a, 18, 16, 586);
    			attr_dev(p1, "class", "svelte-olj37h");
    			add_location(p1, file$a, 19, 16, 651);
    			attr_dev(div3, "class", "year svelte-olj37h");
    			add_location(div3, file$a, 17, 12, 550);
    			attr_dev(div4, "class", "row1 svelte-olj37h");
    			add_location(div4, file$a, 12, 8, 369);
    			attr_dev(div5, "class", "icon svelte-olj37h");
    			add_location(div5, file$a, 24, 16, 777);
    			attr_dev(p2, "class", "svelte-olj37h");
    			add_location(p2, file$a, 25, 16, 842);
    			attr_dev(div6, "class", "mail svelte-olj37h");
    			add_location(div6, file$a, 23, 12, 741);
    			attr_dev(div7, "class", "icon svelte-olj37h");
    			add_location(div7, file$a, 28, 16, 929);
    			attr_dev(p3, "class", "svelte-olj37h");
    			add_location(p3, file$a, 29, 16, 994);
    			attr_dev(div8, "class", "location svelte-olj37h");
    			add_location(div8, file$a, 27, 12, 889);
    			attr_dev(div9, "class", "row2 svelte-olj37h");
    			add_location(div9, file$a, 22, 8, 709);
    			add_location(hr, file$a, 32, 8, 1057);
    			attr_dev(h10, "class", "svelte-olj37h");
    			add_location(h10, file$a, 36, 20, 1179);
    			attr_dev(p4, "class", "svelte-olj37h");
    			add_location(p4, file$a, 37, 20, 1212);
    			attr_dev(div10, "class", "years svelte-olj37h");
    			add_location(div10, file$a, 35, 16, 1138);
    			attr_dev(span, "class", "name svelte-olj37h");
    			add_location(span, file$a, 40, 47, 1348);
    			attr_dev(p5, "class", "svelte-olj37h");
    			add_location(p5, file$a, 40, 20, 1321);
    			attr_dev(div11, "class", "year-bio");
    			add_location(div11, file$a, 39, 16, 1277);
    			attr_dev(div12, "class", "col1 svelte-olj37h");
    			add_location(div12, file$a, 34, 12, 1102);
    			attr_dev(h11, "class", "svelte-olj37h");
    			add_location(h11, file$a, 45, 20, 1604);
    			attr_dev(p6, "class", "svelte-olj37h");
    			add_location(p6, file$a, 46, 20, 1636);
    			attr_dev(div13, "class", "client svelte-olj37h");
    			add_location(div13, file$a, 44, 16, 1562);
    			attr_dev(p7, "class", "svelte-olj37h");
    			add_location(p7, file$a, 49, 20, 1748);
    			attr_dev(div14, "class", "client-bio");
    			add_location(div14, file$a, 48, 16, 1702);
    			attr_dev(div15, "class", "col2 svelte-olj37h");
    			add_location(div15, file$a, 43, 12, 1526);
    			attr_dev(div16, "class", "exp svelte-olj37h");
    			add_location(div16, file$a, 33, 8, 1071);
    			attr_dev(p8, "class", "svelte-olj37h");
    			add_location(p8, file$a, 54, 12, 2001);
    			attr_dev(div17, "class", "about svelte-olj37h");
    			add_location(div17, file$a, 53, 8, 1968);
    			attr_dev(div18, "class", "contact svelte-olj37h");
    			add_location(div18, file$a, 11, 4, 338);
    			attr_dev(div19, "class", "user-detail svelte-olj37h");
    			add_location(div19, file$a, 10, 0, 307);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div19, anchor);
    			append_dev(div19, div18);
    			append_dev(div18, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			mount_component(faphone, div0, null);
    			append_dev(div1, t0);
    			append_dev(div1, p0);
    			append_dev(p0, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			mount_component(facalendar, div2, null);
    			append_dev(div3, t3);
    			append_dev(div3, p1);
    			append_dev(div18, t5);
    			append_dev(div18, div9);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			mount_component(faenvelope, div5, null);
    			append_dev(div6, t6);
    			append_dev(div6, p2);
    			append_dev(p2, t7);
    			append_dev(div9, t8);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			mount_component(falandmark, div7, null);
    			append_dev(div8, t9);
    			append_dev(div8, p3);
    			append_dev(p3, t10);
    			append_dev(div18, t11);
    			append_dev(div18, hr);
    			append_dev(div18, t12);
    			append_dev(div18, div16);
    			append_dev(div16, div12);
    			append_dev(div12, div10);
    			append_dev(div10, h10);
    			append_dev(div10, t14);
    			append_dev(div10, p4);
    			append_dev(div12, t16);
    			append_dev(div12, div11);
    			append_dev(div11, p5);
    			append_dev(p5, t17);
    			append_dev(p5, span);
    			append_dev(span, t18);
    			append_dev(p5, t19);
    			append_dev(div16, t20);
    			append_dev(div16, div15);
    			append_dev(div15, div13);
    			append_dev(div13, h11);
    			append_dev(div13, t22);
    			append_dev(div13, p6);
    			append_dev(div15, t24);
    			append_dev(div15, div14);
    			append_dev(div14, p7);
    			append_dev(div18, t26);
    			append_dev(div18, div17);
    			append_dev(div17, p8);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*mobile*/ 2) set_data_dev(t1, /*mobile*/ ctx[1]);
    			if (!current || dirty & /*mail*/ 1) set_data_dev(t7, /*mail*/ ctx[0]);
    			if (!current || dirty & /*location*/ 4) set_data_dev(t10, /*location*/ ctx[2]);
    			if (!current || dirty & /*name*/ 8) set_data_dev(t18, /*name*/ ctx[3]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faphone.$$.fragment, local);
    			transition_in(facalendar.$$.fragment, local);
    			transition_in(faenvelope.$$.fragment, local);
    			transition_in(falandmark.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faphone.$$.fragment, local);
    			transition_out(facalendar.$$.fragment, local);
    			transition_out(faenvelope.$$.fragment, local);
    			transition_out(falandmark.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div19);
    			destroy_component(faphone);
    			destroy_component(facalendar);
    			destroy_component(faenvelope);
    			destroy_component(falandmark);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserDetail', slots, []);
    	let { mail } = $$props;
    	let { mobile } = $$props;
    	let { location } = $$props;
    	let { name } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (mail === undefined && !('mail' in $$props || $$self.$$.bound[$$self.$$.props['mail']])) {
    			console.warn("<UserDetail> was created without expected prop 'mail'");
    		}

    		if (mobile === undefined && !('mobile' in $$props || $$self.$$.bound[$$self.$$.props['mobile']])) {
    			console.warn("<UserDetail> was created without expected prop 'mobile'");
    		}

    		if (location === undefined && !('location' in $$props || $$self.$$.bound[$$self.$$.props['location']])) {
    			console.warn("<UserDetail> was created without expected prop 'location'");
    		}

    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<UserDetail> was created without expected prop 'name'");
    		}
    	});

    	const writable_props = ['mail', 'mobile', 'location', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UserDetail> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('mail' in $$props) $$invalidate(0, mail = $$props.mail);
    		if ('mobile' in $$props) $$invalidate(1, mobile = $$props.mobile);
    		if ('location' in $$props) $$invalidate(2, location = $$props.location);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		FaPhone,
    		FaEnvelope,
    		FaCalendar,
    		FaLandmark,
    		mail,
    		mobile,
    		location,
    		name
    	});

    	$$self.$inject_state = $$props => {
    		if ('mail' in $$props) $$invalidate(0, mail = $$props.mail);
    		if ('mobile' in $$props) $$invalidate(1, mobile = $$props.mobile);
    		if ('location' in $$props) $$invalidate(2, location = $$props.location);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mail, mobile, location, name];
    }

    class UserDetail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { mail: 0, mobile: 1, location: 2, name: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserDetail",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get mail() {
    		throw new Error("<UserDetail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mail(value) {
    		throw new Error("<UserDetail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mobile() {
    		throw new Error("<UserDetail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mobile(value) {
    		throw new Error("<UserDetail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<UserDetail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<UserDetail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<UserDetail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<UserDetail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\about\UserExp.svelte generated by Svelte v3.59.1 */
    const file$9 = "src\\components\\about\\UserExp.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (46:12) {#each jobData as data}
    function create_each_block$2(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1_value = /*data*/ ctx[3].endYear + "";
    	let t1;
    	let t2;
    	let t3_value = /*data*/ ctx[3].startYear + "";
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let t6_value = /*data*/ ctx[3].company + "";
    	let t6;
    	let t7;
    	let div3;
    	let t8_value = /*data*/ ctx[3].position + "";
    	let t8;
    	let t9;
    	let hr;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("-");
    			t1 = text(t1_value);
    			t2 = text(" - ");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			t5 = text("-");
    			t6 = text(t6_value);
    			t7 = space();
    			div3 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			hr = element("hr");
    			attr_dev(div0, "class", "year");
    			add_location(div0, file$9, 47, 20, 1413);
    			attr_dev(div1, "class", "comp-name");
    			add_location(div1, file$9, 48, 20, 1493);
    			attr_dev(div2, "class", "head-row svelte-hggyiv");
    			add_location(div2, file$9, 46, 16, 1369);
    			attr_dev(div3, "class", "pos svelte-hggyiv");
    			add_location(div3, file$9, 50, 16, 1579);
    			attr_dev(hr, "class", "svelte-hggyiv");
    			add_location(hr, file$9, 51, 16, 1635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(46:12) {#each jobData as data}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div8;
    	let div7;
    	let div5;
    	let p0;
    	let t1;
    	let h2;
    	let t3;
    	let div0;
    	let p1;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div4;
    	let a;
    	let div3;
    	let p2;
    	let t9;
    	let div2;
    	let div1;
    	let faarrowright;
    	let t10;
    	let div6;
    	let current;
    	faarrowright = new FaArrowRight({ props: { size: 14 }, $$inline: true });
    	let each_value = /*jobData*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div7 = element("div");
    			div5 = element("div");
    			p0 = element("p");
    			p0.textContent = "Experience";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "my experience";
    			t3 = space();
    			div0 = element("div");
    			p1 = element("p");
    			t4 = text("Hello there! My name is ");
    			t5 = text(/*name*/ ctx[0]);
    			t6 = text(" I am a web designer & developer,and I'am very Passionate and dedicated to my work.");
    			t7 = space();
    			div4 = element("div");
    			a = element("a");
    			div3 = element("div");
    			p2 = element("p");
    			p2.textContent = "Download my resume";
    			t9 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(faarrowright.$$.fragment);
    			t10 = space();
    			div6 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p0, "class", "svelte-hggyiv");
    			add_location(p0, file$9, 30, 12, 679);
    			attr_dev(h2, "class", "svelte-hggyiv");
    			add_location(h2, file$9, 31, 12, 710);
    			attr_dev(p1, "class", "svelte-hggyiv");
    			add_location(p1, file$9, 33, 16, 781);
    			attr_dev(div0, "class", "bio");
    			add_location(div0, file$9, 32, 12, 746);
    			attr_dev(p2, "class", "svelte-hggyiv");
    			add_location(p2, file$9, 37, 20, 1052);
    			attr_dev(div1, "class", "arrow svelte-hggyiv");
    			add_location(div1, file$9, 39, 24, 1143);
    			attr_dev(div2, "class", "icon svelte-hggyiv");
    			add_location(div2, file$9, 38, 20, 1099);
    			attr_dev(div3, "class", "download-btn svelte-hggyiv");
    			add_location(div3, file$9, 36, 50, 1004);
    			attr_dev(a, "href", /*resumeFilename*/ ctx[1]);
    			attr_dev(a, "download", "");
    			attr_dev(a, "class", "svelte-hggyiv");
    			add_location(a, file$9, 36, 16, 970);
    			attr_dev(div4, "class", "btn svelte-hggyiv");
    			add_location(div4, file$9, 35, 12, 935);
    			attr_dev(div5, "class", "content svelte-hggyiv");
    			add_location(div5, file$9, 29, 8, 644);
    			attr_dev(div6, "class", "works svelte-hggyiv");
    			add_location(div6, file$9, 44, 8, 1295);
    			attr_dev(div7, "class", "exp-box svelte-hggyiv");
    			add_location(div7, file$9, 28, 4, 613);
    			attr_dev(div8, "class", "user-exp svelte-hggyiv");
    			add_location(div8, file$9, 27, 0, 585);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div5, p0);
    			append_dev(div5, t1);
    			append_dev(div5, h2);
    			append_dev(div5, t3);
    			append_dev(div5, div0);
    			append_dev(div0, p1);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, a);
    			append_dev(a, div3);
    			append_dev(div3, p2);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(faarrowright, div1, null);
    			append_dev(div7, t10);
    			append_dev(div7, div6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div6, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t5, /*name*/ ctx[0]);

    			if (!current || dirty & /*resumeFilename*/ 2) {
    				attr_dev(a, "href", /*resumeFilename*/ ctx[1]);
    			}

    			if (dirty & /*jobData*/ 4) {
    				each_value = /*jobData*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div6, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faarrowright.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faarrowright.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_component(faarrowright);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserExp', slots, []);
    	let { name } = $$props;
    	let { resumeFilename } = $$props;

    	const jobData = [
    		{
    			startYear: "Present",
    			endYear: "2022",
    			company: "Freeleance",
    			position: "Frondend Developer"
    		},
    		{
    			startYear: "2022",
    			endYear: "2022",
    			company: "ZOHO",
    			position: "Software Developer"
    		},
    		{
    			startYear: "2019",
    			endYear: "2021",
    			company: "FXEC",
    			position: "Mca"
    		}
    	];

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<UserExp> was created without expected prop 'name'");
    		}

    		if (resumeFilename === undefined && !('resumeFilename' in $$props || $$self.$$.bound[$$self.$$.props['resumeFilename']])) {
    			console.warn("<UserExp> was created without expected prop 'resumeFilename'");
    		}
    	});

    	const writable_props = ['name', 'resumeFilename'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UserExp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('resumeFilename' in $$props) $$invalidate(1, resumeFilename = $$props.resumeFilename);
    	};

    	$$self.$capture_state = () => ({
    		FaArrowRight,
    		name,
    		resumeFilename,
    		jobData
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('resumeFilename' in $$props) $$invalidate(1, resumeFilename = $$props.resumeFilename);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, resumeFilename, jobData];
    }

    class UserExp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { name: 0, resumeFilename: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserExp",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get name() {
    		throw new Error("<UserExp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<UserExp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resumeFilename() {
    		throw new Error("<UserExp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resumeFilename(value) {
    		throw new Error("<UserExp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\about\UserProfile.svelte generated by Svelte v3.59.1 */
    const file$8 = "src\\components\\about\\UserProfile.svelte";

    function create_fragment$8(ctx) {
    	let div5;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h3;
    	let t1;
    	let t2;
    	let p;
    	let span0;
    	let t3;
    	let t4;
    	let span1;
    	let t5;
    	let t6;
    	let div4;
    	let a;
    	let t7;
    	let t8;
    	let div3;
    	let div2;
    	let faarrowright;
    	let current;
    	faarrowright = new FaArrowRight({ props: { size: 14 }, $$inline: true });

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text(/*name*/ ctx[1]);
    			t2 = space();
    			p = element("p");
    			span0 = element("span");
    			t3 = text(/*role*/ ctx[0]);
    			t4 = text(" based in ");
    			span1 = element("span");
    			t5 = text(/*location*/ ctx[2]);
    			t6 = space();
    			div4 = element("div");
    			a = element("a");
    			t7 = text("Download CV");
    			t8 = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(faarrowright.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "userimage");
    			attr_dev(img, "class", "svelte-10g2uen");
    			add_location(img, file$8, 11, 8, 278);
    			attr_dev(div0, "class", "user-img svelte-10g2uen");
    			add_location(div0, file$8, 10, 4, 246);
    			attr_dev(h3, "class", "svelte-10g2uen");
    			add_location(h3, file$8, 14, 8, 358);
    			attr_dev(span0, "class", "role svelte-10g2uen");
    			add_location(span0, file$8, 15, 11, 386);
    			attr_dev(span1, "class", "role svelte-10g2uen");
    			add_location(span1, file$8, 15, 53, 428);
    			attr_dev(p, "class", "svelte-10g2uen");
    			add_location(p, file$8, 15, 8, 383);
    			attr_dev(div1, "class", "about svelte-10g2uen");
    			add_location(div1, file$8, 13, 4, 329);
    			attr_dev(a, "href", /*resumeFilename*/ ctx[3]);
    			attr_dev(a, "download", "");
    			attr_dev(a, "class", "svelte-10g2uen");
    			add_location(a, file$8, 18, 8, 512);
    			attr_dev(div2, "class", "arrow svelte-10g2uen");
    			add_location(div2, file$8, 19, 26, 589);
    			attr_dev(div3, "class", "icon svelte-10g2uen");
    			add_location(div3, file$8, 19, 8, 571);
    			attr_dev(div4, "class", "cv svelte-10g2uen");
    			add_location(div4, file$8, 17, 4, 486);
    			attr_dev(div5, "class", "user-detail svelte-10g2uen");
    			add_location(div5, file$8, 9, 0, 215);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, img);
    			append_dev(div5, t0);
    			append_dev(div5, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, span0);
    			append_dev(span0, t3);
    			append_dev(p, t4);
    			append_dev(p, span1);
    			append_dev(span1, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, a);
    			append_dev(a, t7);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			mount_component(faarrowright, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data_dev(t1, /*name*/ ctx[1]);
    			if (!current || dirty & /*role*/ 1) set_data_dev(t3, /*role*/ ctx[0]);
    			if (!current || dirty & /*location*/ 4) set_data_dev(t5, /*location*/ ctx[2]);

    			if (!current || dirty & /*resumeFilename*/ 8) {
    				attr_dev(a, "href", /*resumeFilename*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faarrowright.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faarrowright.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(faarrowright);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserProfile', slots, []);
    	let { role } = $$props;
    	let { name } = $$props;
    	let { location } = $$props;
    	let { resumeFilename } = $$props;
    	let src = '../images/user.png';

    	$$self.$$.on_mount.push(function () {
    		if (role === undefined && !('role' in $$props || $$self.$$.bound[$$self.$$.props['role']])) {
    			console.warn("<UserProfile> was created without expected prop 'role'");
    		}

    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<UserProfile> was created without expected prop 'name'");
    		}

    		if (location === undefined && !('location' in $$props || $$self.$$.bound[$$self.$$.props['location']])) {
    			console.warn("<UserProfile> was created without expected prop 'location'");
    		}

    		if (resumeFilename === undefined && !('resumeFilename' in $$props || $$self.$$.bound[$$self.$$.props['resumeFilename']])) {
    			console.warn("<UserProfile> was created without expected prop 'resumeFilename'");
    		}
    	});

    	const writable_props = ['role', 'name', 'location', 'resumeFilename'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UserProfile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('role' in $$props) $$invalidate(0, role = $$props.role);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('location' in $$props) $$invalidate(2, location = $$props.location);
    		if ('resumeFilename' in $$props) $$invalidate(3, resumeFilename = $$props.resumeFilename);
    	};

    	$$self.$capture_state = () => ({
    		FaArrowRight,
    		role,
    		name,
    		location,
    		resumeFilename,
    		src
    	});

    	$$self.$inject_state = $$props => {
    		if ('role' in $$props) $$invalidate(0, role = $$props.role);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('location' in $$props) $$invalidate(2, location = $$props.location);
    		if ('resumeFilename' in $$props) $$invalidate(3, resumeFilename = $$props.resumeFilename);
    		if ('src' in $$props) $$invalidate(4, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [role, name, location, resumeFilename, src];
    }

    class UserProfile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			role: 0,
    			name: 1,
    			location: 2,
    			resumeFilename: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserProfile",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get role() {
    		throw new Error("<UserProfile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<UserProfile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<UserProfile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<UserProfile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<UserProfile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<UserProfile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resumeFilename() {
    		throw new Error("<UserProfile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resumeFilename(value) {
    		throw new Error("<UserProfile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\about\About.svelte generated by Svelte v3.59.1 */
    const file$7 = "src\\components\\about\\About.svelte";

    function create_fragment$7(ctx) {
    	let div4;
    	let div0;
    	let p;
    	let t1;
    	let h1;
    	let t3;
    	let div3;
    	let div1;
    	let userprofile;
    	let t4;
    	let div2;
    	let userdetail;
    	let t5;
    	let userexp;
    	let div4_transition;
    	let current;

    	const userprofile_spread_levels = [
    		/*data*/ ctx[1],
    		{
    			resumeFilename: /*resumeFilename*/ ctx[0]
    		}
    	];

    	let userprofile_props = {};

    	for (let i = 0; i < userprofile_spread_levels.length; i += 1) {
    		userprofile_props = assign(userprofile_props, userprofile_spread_levels[i]);
    	}

    	userprofile = new UserProfile({ props: userprofile_props, $$inline: true });
    	const userdetail_spread_levels = [/*data*/ ctx[1]];
    	let userdetail_props = {};

    	for (let i = 0; i < userdetail_spread_levels.length; i += 1) {
    		userdetail_props = assign(userdetail_props, userdetail_spread_levels[i]);
    	}

    	userdetail = new UserDetail({ props: userdetail_props, $$inline: true });

    	const userexp_spread_levels = [
    		/*data*/ ctx[1],
    		{
    			resumeFilename: /*resumeFilename*/ ctx[0]
    		}
    	];

    	let userexp_props = {};

    	for (let i = 0; i < userexp_spread_levels.length; i += 1) {
    		userexp_props = assign(userexp_props, userexp_spread_levels[i]);
    	}

    	userexp = new UserExp({ props: userexp_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Nice to meet you!";
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "welcome to...";
    			t3 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(userprofile.$$.fragment);
    			t4 = space();
    			div2 = element("div");
    			create_component(userdetail.$$.fragment);
    			t5 = space();
    			create_component(userexp.$$.fragment);
    			attr_dev(p, "class", "svelte-apjqvg");
    			add_location(p, file$7, 19, 8, 555);
    			attr_dev(h1, "class", "svelte-apjqvg");
    			add_location(h1, file$7, 20, 8, 589);
    			attr_dev(div0, "class", "header svelte-apjqvg");
    			add_location(div0, file$7, 18, 4, 525);
    			attr_dev(div1, "class", "user-profile svelte-apjqvg");
    			add_location(div1, file$7, 23, 8, 661);
    			attr_dev(div2, "class", "user-details svelte-apjqvg");
    			add_location(div2, file$7, 26, 8, 766);
    			attr_dev(div3, "class", "user-bio svelte-apjqvg");
    			add_location(div3, file$7, 22, 4, 629);
    			attr_dev(div4, "class", "about-container svelte-apjqvg");
    			add_location(div4, file$7, 17, 0, 474);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, p);
    			append_dev(div0, t1);
    			append_dev(div0, h1);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			mount_component(userprofile, div1, null);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			mount_component(userdetail, div2, null);
    			append_dev(div4, t5);
    			mount_component(userexp, div4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const userprofile_changes = (dirty & /*data, resumeFilename*/ 3)
    			? get_spread_update(userprofile_spread_levels, [
    					dirty & /*data*/ 2 && get_spread_object(/*data*/ ctx[1]),
    					dirty & /*resumeFilename*/ 1 && {
    						resumeFilename: /*resumeFilename*/ ctx[0]
    					}
    				])
    			: {};

    			userprofile.$set(userprofile_changes);

    			const userdetail_changes = (dirty & /*data*/ 2)
    			? get_spread_update(userdetail_spread_levels, [get_spread_object(/*data*/ ctx[1])])
    			: {};

    			userdetail.$set(userdetail_changes);

    			const userexp_changes = (dirty & /*data, resumeFilename*/ 3)
    			? get_spread_update(userexp_spread_levels, [
    					dirty & /*data*/ 2 && get_spread_object(/*data*/ ctx[1]),
    					dirty & /*resumeFilename*/ 1 && {
    						resumeFilename: /*resumeFilename*/ ctx[0]
    					}
    				])
    			: {};

    			userexp.$set(userexp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(userprofile.$$.fragment, local);
    			transition_in(userdetail.$$.fragment, local);
    			transition_in(userexp.$$.fragment, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, true);
    				div4_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(userprofile.$$.fragment, local);
    			transition_out(userdetail.$$.fragment, local);
    			transition_out(userexp.$$.fragment, local);
    			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, {}, false);
    			div4_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(userprofile);
    			destroy_component(userdetail);
    			destroy_component(userexp);
    			if (detaching && div4_transition) div4_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	let resumeFilename = 'N Ramesh CV23.pdf';

    	let data = {
    		name: "Ramesh kannan...",
    		role: "Software Developer",
    		location: "Tamil Nadu",
    		mobile: "8825681631",
    		mail: "nrkannann@gmail.com",
    		src: "../images/user.png"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		UserDetail,
    		UserExp,
    		UserProfile,
    		slide,
    		fade,
    		fly,
    		resumeFilename,
    		data
    	});

    	$$self.$inject_state = $$props => {
    		if ('resumeFilename' in $$props) $$invalidate(0, resumeFilename = $$props.resumeFilename);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resumeFilename, data];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\contact\Register.svelte generated by Svelte v3.59.1 */
    const file$6 = "src\\components\\contact\\Register.svelte";

    // (42:4) {:else}
    function create_else_block$1(ctx) {
    	let form;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let label2;
    	let t7;
    	let input2;
    	let t8;
    	let div2;
    	let input3;
    	let t9;
    	let label3;
    	let i;
    	let t10;
    	let t11;
    	let span;
    	let t12;
    	let button;
    	let t13;
    	let div1;
    	let div0;
    	let faarrowright;
    	let current;
    	let mounted;
    	let dispose;
    	faarrowright = new FaArrowRight({ props: { size: 14 }, $$inline: true });

    	const block = {
    		c: function create() {
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "NAME";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			label1.textContent = "EMAIL";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			label2.textContent = "MESSAGE";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			div2 = element("div");
    			input3 = element("input");
    			t9 = space();
    			label3 = element("label");
    			i = element("i");
    			t10 = text(" Attach File");
    			t11 = space();
    			span = element("span");
    			t12 = space();
    			button = element("button");
    			t13 = text("Submit now ");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(faarrowright.$$.fragment);
    			attr_dev(label0, "for", "name");
    			attr_dev(label0, "class", "svelte-13dk7kh");
    			add_location(label0, file$6, 43, 8, 1107);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-13dk7kh");
    			add_location(input0, file$6, 44, 8, 1147);
    			attr_dev(label1, "for", "mail");
    			attr_dev(label1, "class", "svelte-13dk7kh");
    			add_location(label1, file$6, 45, 8, 1198);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "class", "svelte-13dk7kh");
    			add_location(input1, file$6, 46, 8, 1239);
    			attr_dev(label2, "for", "msg");
    			attr_dev(label2, "class", "svelte-13dk7kh");
    			add_location(label2, file$6, 47, 8, 1288);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "svelte-13dk7kh");
    			add_location(input2, file$6, 48, 8, 1330);
    			attr_dev(input3, "type", "file");
    			attr_dev(input3, "name", "file");
    			attr_dev(input3, "id", "file-input");
    			attr_dev(input3, "class", "input-file svelte-13dk7kh");
    			add_location(input3, file$6, 50, 12, 1416);
    			attr_dev(i, "class", "fa fa-paperclip svelte-13dk7kh");
    			add_location(i, file$6, 52, 14, 1586);
    			attr_dev(label3, "for", "file-input");
    			attr_dev(label3, "class", "label-file svelte-13dk7kh");
    			add_location(label3, file$6, 51, 12, 1527);
    			attr_dev(span, "class", "file-name svelte-13dk7kh");
    			add_location(span, file$6, 54, 12, 1665);
    			attr_dev(div0, "class", "arrow svelte-13dk7kh");
    			add_location(div0, file$6, 55, 59, 1757);
    			attr_dev(div1, "class", "icon svelte-13dk7kh");
    			add_location(div1, file$6, 55, 41, 1739);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-13dk7kh");
    			add_location(button, file$6, 55, 8, 1706);
    			attr_dev(div2, "class", "file-input svelte-13dk7kh");
    			add_location(div2, file$6, 49, 8, 1378);
    			attr_dev(form, "class", "svelte-13dk7kh");
    			add_location(form, file$6, 42, 4, 1049);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(form, t1);
    			append_dev(form, input0);
    			set_input_value(input0, /*uname*/ ctx[1]);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(form, t4);
    			append_dev(form, input1);
    			set_input_value(input1, /*email*/ ctx[2]);
    			append_dev(form, t5);
    			append_dev(form, label2);
    			append_dev(form, t7);
    			append_dev(form, input2);
    			set_input_value(input2, /*msg*/ ctx[3]);
    			append_dev(form, t8);
    			append_dev(form, div2);
    			append_dev(div2, input3);
    			append_dev(div2, t9);
    			append_dev(div2, label3);
    			append_dev(label3, i);
    			append_dev(label3, t10);
    			append_dev(div2, t11);
    			append_dev(div2, span);
    			append_dev(div2, t12);
    			append_dev(div2, button);
    			append_dev(button, t13);
    			append_dev(button, div1);
    			append_dev(div1, div0);
    			mount_component(faarrowright, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[8]),
    					listen_dev(input3, "change", /*handleFileChange*/ ctx[4], false, false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[5]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*uname*/ 2 && input0.value !== /*uname*/ ctx[1]) {
    				set_input_value(input0, /*uname*/ ctx[1]);
    			}

    			if (dirty & /*email*/ 4 && input1.value !== /*email*/ ctx[2]) {
    				set_input_value(input1, /*email*/ ctx[2]);
    			}

    			if (dirty & /*msg*/ 8 && input2.value !== /*msg*/ ctx[3]) {
    				set_input_value(input2, /*msg*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faarrowright.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faarrowright.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(faarrowright);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(42:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {#if submissionSuccessful}
    function create_if_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Form submitted successfully!";
    			add_location(p, file$6, 40, 8, 995);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:4) {#if submissionSuccessful}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*submissionSuccessful*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "any project?";
    			t1 = space();
    			if_block.c();
    			attr_dev(h1, "class", "svelte-13dk7kh");
    			add_location(h1, file$6, 38, 4, 932);
    			attr_dev(div, "class", "reg-box svelte-13dk7kh");
    			add_location(div, file$6, 37, 0, 905);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Register', slots, []);
    	let submissionSuccessful = false;
    	const formData = writable([]);
    	let uname, email, msg, selectedFiles = [];

    	function handleFileChange(event) {
    		const files = event.target.files;
    		selectedFiles = Array.from(files);
    	}

    	function handleSubmit() {
    		const data = {
    			name: uname,
    			email,
    			message: msg,
    			files: selectedFiles
    		};

    		formData.update(currentData => [...currentData, data]);
    		$$invalidate(1, uname = '');
    		$$invalidate(2, email = '');
    		$$invalidate(3, msg = '');
    		selectedFiles = [];
    		$$invalidate(0, submissionSuccessful = true);

    		setTimeout(
    			() => {
    				$$invalidate(0, submissionSuccessful = false);
    			},
    			3000
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Register> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		uname = this.value;
    		$$invalidate(1, uname);
    	}

    	function input1_input_handler() {
    		email = this.value;
    		$$invalidate(2, email);
    	}

    	function input2_input_handler() {
    		msg = this.value;
    		$$invalidate(3, msg);
    	}

    	$$self.$capture_state = () => ({
    		FaArrowRight,
    		writable,
    		submissionSuccessful,
    		formData,
    		uname,
    		email,
    		msg,
    		selectedFiles,
    		handleFileChange,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('submissionSuccessful' in $$props) $$invalidate(0, submissionSuccessful = $$props.submissionSuccessful);
    		if ('uname' in $$props) $$invalidate(1, uname = $$props.uname);
    		if ('email' in $$props) $$invalidate(2, email = $$props.email);
    		if ('msg' in $$props) $$invalidate(3, msg = $$props.msg);
    		if ('selectedFiles' in $$props) selectedFiles = $$props.selectedFiles;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		submissionSuccessful,
    		uname,
    		email,
    		msg,
    		handleFileChange,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class Register extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Register",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\contact\Contact.svelte generated by Svelte v3.59.1 */
    const file$5 = "src\\components\\contact\\Contact.svelte";

    function create_fragment$5(ctx) {
    	let div6;
    	let div5;
    	let div3;
    	let h6;
    	let t1;
    	let h1;
    	let t3;
    	let div0;
    	let address;
    	let t5;
    	let div1;
    	let p0;
    	let t7;
    	let p1;
    	let t9;
    	let div2;
    	let ol;
    	let a0;
    	let li0;
    	let t11;
    	let a1;
    	let li1;
    	let t13;
    	let a2;
    	let li2;
    	let t15;
    	let a3;
    	let li3;
    	let t17;
    	let div4;
    	let register;
    	let div6_transition;
    	let current;
    	register = new Register({ $$inline: true });

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Contact";
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "Reach out me";
    			t3 = space();
    			div0 = element("div");
    			address = element("address");
    			address.textContent = "7/96 South ST Chellaththayarpuram,Pavoorchathram Tenkasi TamilNadu 627808.";
    			t5 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "+918825681631";
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "nrkannann@gmail.com";
    			t9 = space();
    			div2 = element("div");
    			ol = element("ol");
    			a0 = element("a");
    			li0 = element("li");
    			li0.textContent = "facebook";
    			t11 = space();
    			a1 = element("a");
    			li1 = element("li");
    			li1.textContent = "leetcode";
    			t13 = space();
    			a2 = element("a");
    			li2 = element("li");
    			li2.textContent = "instagram";
    			t15 = space();
    			a3 = element("a");
    			li3 = element("li");
    			li3.textContent = "linkedin";
    			t17 = space();
    			div4 = element("div");
    			create_component(register.$$.fragment);
    			add_location(h6, file$5, 7, 12, 236);
    			attr_dev(h1, "class", "svelte-hl6y06");
    			add_location(h1, file$5, 8, 12, 266);
    			add_location(address, file$5, 10, 16, 340);
    			attr_dev(div0, "class", "address svelte-hl6y06");
    			add_location(div0, file$5, 9, 12, 301);
    			add_location(p0, file$5, 15, 16, 551);
    			add_location(p1, file$5, 16, 16, 589);
    			attr_dev(div1, "class", "user-contact svelte-hl6y06");
    			add_location(div1, file$5, 14, 12, 507);
    			attr_dev(li0, "class", "svelte-hl6y06");
    			add_location(li0, file$5, 20, 33, 726);
    			attr_dev(a0, "href", "#f");
    			attr_dev(a0, "class", "svelte-hl6y06");
    			add_location(a0, file$5, 20, 20, 713);
    			attr_dev(li1, "class", "svelte-hl6y06");
    			add_location(li1, file$5, 21, 66, 815);
    			attr_dev(a1, "href", "https://leetcode.com/kannan-ramesh/");
    			attr_dev(a1, "class", "svelte-hl6y06");
    			add_location(a1, file$5, 21, 20, 769);
    			attr_dev(li2, "class", "svelte-hl6y06");
    			add_location(li2, file$5, 22, 75, 913);
    			attr_dev(a2, "href", "https://www.instagram.com/nrk_kannan_ramesh/");
    			attr_dev(a2, "class", "svelte-hl6y06");
    			add_location(a2, file$5, 22, 20, 858);
    			attr_dev(li3, "class", "svelte-hl6y06");
    			add_location(li3, file$5, 23, 83, 1020);
    			attr_dev(a3, "href", "https://www.linkedin.com/in/ramesh-kannan-247076170/");
    			attr_dev(a3, "class", "svelte-hl6y06");
    			add_location(a3, file$5, 23, 20, 957);
    			attr_dev(ol, "class", "svelte-hl6y06");
    			add_location(ol, file$5, 19, 16, 687);
    			attr_dev(div2, "class", "social");
    			add_location(div2, file$5, 18, 12, 649);
    			attr_dev(div3, "class", "contact svelte-hl6y06");
    			add_location(div3, file$5, 6, 8, 201);
    			attr_dev(div4, "class", "reg svelte-hl6y06");
    			add_location(div4, file$5, 27, 8, 1110);
    			attr_dev(div5, "class", "cont svelte-hl6y06");
    			add_location(div5, file$5, 5, 4, 173);
    			attr_dev(div6, "class", "contact-container svelte-hl6y06");
    			add_location(div6, file$5, 4, 0, 121);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h6);
    			append_dev(div3, t1);
    			append_dev(div3, h1);
    			append_dev(div3, t3);
    			append_dev(div3, div0);
    			append_dev(div0, address);
    			append_dev(div3, t5);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t7);
    			append_dev(div1, p1);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, ol);
    			append_dev(ol, a0);
    			append_dev(a0, li0);
    			append_dev(ol, t11);
    			append_dev(ol, a1);
    			append_dev(a1, li1);
    			append_dev(ol, t13);
    			append_dev(ol, a2);
    			append_dev(a2, li2);
    			append_dev(ol, t15);
    			append_dev(ol, a3);
    			append_dev(a3, li3);
    			append_dev(div5, t17);
    			append_dev(div5, div4);
    			mount_component(register, div4, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(register.$$.fragment, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div6_transition) div6_transition = create_bidirectional_transition(div6, fly, {}, true);
    				div6_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(register.$$.fragment, local);
    			if (!div6_transition) div6_transition = create_bidirectional_transition(div6, fly, {}, false);
    			div6_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(register);
    			if (detaching && div6_transition) div6_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Register, slide, fade, fly });
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Services.svelte generated by Svelte v3.59.1 */
    const file$4 = "src\\components\\Services.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (45:24) {#if item.act}
    function create_if_block_1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[4].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "job special");
    			attr_dev(img, "class", "svelte-1ij12fc");
    			add_location(img, file$4, 45, 124, 1990);
    			attr_dev(div, "class", "image");
    			add_location(div, file$4, 45, 28, 1894);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*serviceData*/ 1 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[4].img)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!current) return;
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, { x: 200, duration: 2000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { x: 200, duration: 2000 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(45:24) {#if item.act}",
    		ctx
    	});

    	return block;
    }

    // (53:24) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[3](/*index*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "+";
    			attr_dev(button, "class", "btns svelte-1ij12fc");
    			add_location(button, file$4, 53, 28, 2388);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(53:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:24) {#if item.act}
    function create_if_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*index*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "-";
    			attr_dev(button, "class", "btns svelte-1ij12fc");
    			add_location(button, file$4, 51, 28, 2263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(51:24) {#if item.act}",
    		ctx
    	});

    	return block;
    }

    // (40:8) {#each serviceData as item,index}
    function create_each_block$1(ctx) {
    	let ul;
    	let li;
    	let div0;
    	let t0_value = /*item*/ ctx[4].job + "";
    	let t0;
    	let t1;
    	let div2;
    	let t2;
    	let div1;
    	let t3_value = /*item*/ ctx[4].desc + "";
    	let t3;
    	let t4;
    	let div3;
    	let t5;
    	let hr;
    	let current;
    	let if_block0 = /*item*/ ctx[4].act && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[4].act) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li = element("li");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");
    			if_block1.c();
    			t5 = space();
    			hr = element("hr");
    			attr_dev(div0, "class", "role svelte-1ij12fc");
    			toggle_class(div0, "selected", /*item*/ ctx[4].activeIndex === /*index*/ ctx[6]);
    			add_location(div0, file$4, 42, 20, 1701);
    			attr_dev(div1, "class", "des svelte-1ij12fc");
    			add_location(div1, file$4, 47, 24, 2092);
    			attr_dev(div2, "class", "right-box svelte-1ij12fc");
    			add_location(div2, file$4, 43, 20, 1801);
    			attr_dev(div3, "class", "btn svelte-1ij12fc");
    			add_location(div3, file$4, 49, 20, 2176);
    			attr_dev(li, "class", "svelte-1ij12fc");
    			add_location(li, file$4, 41, 16, 1675);
    			add_location(ul, file$4, 40, 12, 1653);
    			attr_dev(hr, "class", "svelte-1ij12fc");
    			add_location(hr, file$4, 58, 12, 2566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li);
    			append_dev(li, div0);
    			append_dev(div0, t0);
    			append_dev(li, t1);
    			append_dev(li, div2);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(li, t4);
    			append_dev(li, div3);
    			if_block1.m(div3, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*serviceData*/ 1) && t0_value !== (t0_value = /*item*/ ctx[4].job + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*serviceData*/ 1) {
    				toggle_class(div0, "selected", /*item*/ ctx[4].activeIndex === /*index*/ ctx[6]);
    			}

    			if (/*item*/ ctx[4].act) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*serviceData*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*serviceData*/ 1) && t3_value !== (t3_value = /*item*/ ctx[4].desc + "")) set_data_dev(t3, t3_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(40:8) {#each serviceData as item,index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let h4;
    	let t1;
    	let h1;
    	let t3;
    	let div0;
    	let div1_transition;
    	let current;
    	let each_value = /*serviceData*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Service";
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "My specialties";
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h4, file$4, 36, 4, 1516);
    			attr_dev(h1, "class", "svelte-1ij12fc");
    			add_location(h1, file$4, 37, 4, 1538);
    			attr_dev(div0, "class", "service-special svelte-1ij12fc");
    			add_location(div0, file$4, 38, 4, 1567);
    			attr_dev(div1, "class", "service-container svelte-1ij12fc");
    			add_location(div1, file$4, 35, 0, 1464);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h4);
    			append_dev(div1, t1);
    			append_dev(div1, h1);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toggle, serviceData*/ 3) {
    				each_value = /*serviceData*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);

    	const serviceData = [
    		{
    			job: "Web design",
    			desc: "You can customize a template or make your from scratch,  with an immersive library at your disposal. You can customize a template",
    			img: '../images/webdesign.png',
    			act: false,
    			activeIndex: null
    		},
    		{
    			job: "Software Developer",
    			desc: "You can customize a template or make your from scratch,  with an immersive library at your disposal. You can customize a template",
    			img: '../images/sd.png',
    			act: false,
    			activeIndex: null
    		},
    		{
    			job: "Back End",
    			desc: "You can customize a template or make your from scratch,  with an immersive library at your disposal. You can customize a template",
    			img: '../images/backend.png',
    			act: false,
    			activeIndex: null
    		},
    		{
    			job: "User Research",
    			desc: "You can customize a template or make your from scratch,  with an immersive library at your disposal. You can customize a template",
    			img: '../images/research.jpg',
    			act: false,
    			activeIndex: null
    		}
    	];

    	function toggle(index) {
    		$$invalidate(0, serviceData[index].act = !serviceData[index].act, serviceData);
    		$$invalidate(0, serviceData[index].activeIndex = serviceData[index].act ? index : null, serviceData);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => toggle(index);
    	const click_handler_1 = index => toggle(index);
    	$$self.$capture_state = () => ({ fade, fly, serviceData, toggle });
    	return [serviceData, toggle, click_handler, click_handler_1];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\work\Think.svelte generated by Svelte v3.59.1 */

    const file$3 = "src\\components\\work\\Think.svelte";

    function create_fragment$3(ctx) {
    	let div5;
    	let div0;
    	let h6;
    	let t1;
    	let h1;
    	let t3;
    	let div4;
    	let div1;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let p0;
    	let t5_value = /*quotes*/ ctx[1][/*currentQuoteIndex*/ ctx[0]].text + "";
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let t8_value = /*quotes*/ ctx[1][/*currentQuoteIndex*/ ctx[0]].author + "";
    	let t8;
    	let t9;
    	let div2;
    	let button0;
    	let t11;
    	let button1;
    	let t13;
    	let hr;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Testimonial";
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "what they says";
    			t3 = space();
    			div4 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			p0 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			p1 = element("p");
    			t7 = text("- ");
    			t8 = text(t8_value);
    			t9 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "<";
    			t11 = space();
    			button1 = element("button");
    			button1.textContent = ">";
    			t13 = space();
    			hr = element("hr");
    			attr_dev(h6, "class", "svelte-1s5n0um");
    			add_location(h6, file$3, 31, 8, 1081);
    			attr_dev(h1, "class", "svelte-1s5n0um");
    			add_location(h1, file$3, 32, 8, 1111);
    			attr_dev(div0, "class", "head svelte-1s5n0um");
    			add_location(div0, file$3, 30, 4, 1053);
    			if (!src_url_equal(img.src, img_src_value = /*quotes*/ ctx[1][/*currentQuoteIndex*/ ctx[0]].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "author");
    			attr_dev(img, "class", "svelte-1s5n0um");
    			add_location(img, file$3, 36, 12, 1221);
    			attr_dev(div1, "class", "img");
    			add_location(div1, file$3, 35, 8, 1190);
    			attr_dev(p0, "class", "svelte-1s5n0um");
    			add_location(p0, file$3, 39, 10, 1333);
    			attr_dev(p1, "class", "author svelte-1s5n0um");
    			add_location(p1, file$3, 40, 10, 1384);
    			attr_dev(button0, "class", "svelte-1s5n0um");
    			add_location(button0, file$3, 42, 12, 1490);
    			attr_dev(button1, "class", "svelte-1s5n0um");
    			add_location(button1, file$3, 43, 12, 1554);
    			attr_dev(div2, "class", "controls svelte-1s5n0um");
    			add_location(div2, file$3, 41, 10, 1454);
    			attr_dev(div3, "class", "quote svelte-1s5n0um");
    			add_location(div3, file$3, 38, 8, 1302);
    			attr_dev(div4, "class", "quote-carousel svelte-1s5n0um");
    			add_location(div4, file$3, 34, 4, 1152);
    			attr_dev(hr, "class", "svelte-1s5n0um");
    			add_location(hr, file$3, 47, 4, 1652);
    			attr_dev(div5, "class", "think-container svelte-1s5n0um");
    			add_location(div5, file$3, 29, 0, 1018);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, h6);
    			append_dev(div0, t1);
    			append_dev(div0, h1);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, p0);
    			append_dev(p0, t5);
    			append_dev(div3, t6);
    			append_dev(div3, p1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t11);
    			append_dev(div2, button1);
    			append_dev(div5, t13);
    			append_dev(div5, hr);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*showPreviousQuote*/ ctx[3], false, false, false, false),
    					listen_dev(button1, "click", /*showNextQuote*/ ctx[2], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentQuoteIndex*/ 1 && !src_url_equal(img.src, img_src_value = /*quotes*/ ctx[1][/*currentQuoteIndex*/ ctx[0]].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*currentQuoteIndex*/ 1 && t5_value !== (t5_value = /*quotes*/ ctx[1][/*currentQuoteIndex*/ ctx[0]].text + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*currentQuoteIndex*/ 1 && t8_value !== (t8_value = /*quotes*/ ctx[1][/*currentQuoteIndex*/ ctx[0]].author + "")) set_data_dev(t8, t8_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Think', slots, []);

    	let quotes = [
    		{
    			text: "“A person who is happy is not because everything is right in his life, He is happy because his attitude towards everything in his life is right.”",
    			author: "sundher pichai",
    			img: '../images/sundher.jpg'
    		},
    		{
    			text: "“Don't take rest after your first victory because if you fail in second, more lips are waiting to say that your first victory was just luck.”27",
    			author: "APJ ",
    			img: '../images/apj.jpg'
    		},
    		{
    			text: "“A person who is happy is not because everything is right in his life, He is happy because his attitude towards everything in his life is right.”",
    			author: "Ramesh Kannan",
    			img: '../images/user.png'
    		}
    	];

    	let currentQuoteIndex = 0;

    	function showNextQuote() {
    		$$invalidate(0, currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length);
    	}

    	function showPreviousQuote() {
    		$$invalidate(0, currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Think> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		quotes,
    		currentQuoteIndex,
    		showNextQuote,
    		showPreviousQuote
    	});

    	$$self.$inject_state = $$props => {
    		if ('quotes' in $$props) $$invalidate(1, quotes = $$props.quotes);
    		if ('currentQuoteIndex' in $$props) $$invalidate(0, currentQuoteIndex = $$props.currentQuoteIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentQuoteIndex, quotes, showNextQuote, showPreviousQuote];
    }

    class Think extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Think",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\work\Works.svelte generated by Svelte v3.59.1 */
    const file$2 = "src\\components\\work\\Works.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (32:8) {#each project as item}
    function create_each_block(ctx) {
    	let div4;
    	let div2;
    	let p;
    	let t0_value = /*item*/ ctx[1].head + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = /*item*/ ctx[1].name + "";
    	let t2;
    	let t3;
    	let a;
    	let div1;
    	let faarrowright;
    	let t4;
    	let div3;
    	let img;
    	let img_src_value;
    	let t5;
    	let current;
    	faarrowright = new FaArrowRight({ props: { size: 14 }, $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			a = element("a");
    			div1 = element("div");
    			create_component(faarrowright.$$.fragment);
    			t4 = space();
    			div3 = element("div");
    			img = element("img");
    			t5 = space();
    			attr_dev(p, "class", "svelte-1lg2ctg");
    			add_location(p, file$2, 34, 16, 997);
    			attr_dev(div0, "class", "name svelte-1lg2ctg");
    			add_location(div0, file$2, 35, 16, 1033);
    			attr_dev(div1, "class", "arrow svelte-1lg2ctg");
    			add_location(div1, file$2, 36, 58, 1128);
    			attr_dev(a, "href", "https://github.com/kannan-ramesh");
    			attr_dev(a, "class", "svelte-1lg2ctg");
    			add_location(a, file$2, 36, 15, 1085);
    			attr_dev(div2, "class", "head svelte-1lg2ctg");
    			add_location(div2, file$2, 33, 12, 961);
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[1].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "project logo");
    			attr_dev(img, "class", "svelte-1lg2ctg");
    			add_location(img, file$2, 39, 16, 1251);
    			attr_dev(div3, "class", "img svelte-1lg2ctg");
    			add_location(div3, file$2, 38, 12, 1216);
    			attr_dev(div4, "class", "heading svelte-1lg2ctg");
    			add_location(div4, file$2, 32, 8, 926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, p);
    			append_dev(p, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, a);
    			append_dev(a, div1);
    			mount_component(faarrowright, div1, null);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, img);
    			append_dev(div4, t5);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faarrowright.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faarrowright.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(faarrowright);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(32:8) {#each project as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let h5;
    	let t1;
    	let h1;
    	let t3;
    	let div0;
    	let t4;
    	let think;
    	let div1_transition;
    	let current;
    	let each_value = /*project*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	think = new Think({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Work";
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "Recent Project";
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			create_component(think.$$.fragment);
    			add_location(h5, file$2, 28, 4, 813);
    			add_location(h1, file$2, 29, 4, 832);
    			attr_dev(div0, "class", "projects svelte-1lg2ctg");
    			add_location(div0, file$2, 30, 4, 861);
    			attr_dev(div1, "class", "work-container svelte-1lg2ctg");
    			add_location(div1, file$2, 27, 0, 756);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h5);
    			append_dev(div1, t1);
    			append_dev(div1, h1);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div1, t4);
    			mount_component(think, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*project*/ 1) {
    				each_value = /*project*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(think.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!current) return;
    					if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    					div1_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(think.$$.fragment, local);

    			if (local) {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    				div1_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			destroy_component(think);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Works', slots, []);

    	const project = [
    		{
    			head: "BackEnd case study",
    			name: "Imdb WebApp",
    			img: '../images/imdb.jpg'
    		},
    		{
    			head: "UI case study",
    			name: "ToDo WebApp",
    			img: '../images/todo.jpg'
    		},
    		{
    			head: "BackEnd case study",
    			name: "Airline WebApp",
    			img: '../images/airline.jpg'
    		},
    		{
    			head: "BackEnd case study",
    			name: "railway WebApp",
    			img: '../images/railway.jpg'
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Works> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		FaArrowRight,
    		Think,
    		slide,
    		fade,
    		fly,
    		project
    	});

    	return [project];
    }

    class Works extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Works",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    var routes = {
        '/':Home,
        '/about/':About,
        '/contact/':Contact,
        '/service/':Services,
        '/works/':Works,
    };

    /* src\SideBar.svelte generated by Svelte v3.59.1 */
    const file$1 = "src\\SideBar.svelte";

    function create_fragment$1(ctx) {
    	let div6;
    	let div0;
    	let h3;
    	let t1;
    	let div1;
    	let ul;
    	let li0;
    	let a0;
    	let t2;
    	let a0_class_value;
    	let t3;
    	let li1;
    	let a1;
    	let t4;
    	let a1_class_value;
    	let t5;
    	let li2;
    	let a2;
    	let t6;
    	let a2_class_value;
    	let t7;
    	let li3;
    	let a3;
    	let t8;
    	let a3_class_value;
    	let t9;
    	let li4;
    	let a4;
    	let t10;
    	let a4_class_value;
    	let t11;
    	let div5;
    	let a5;
    	let div2;
    	let falinkedin;
    	let t12;
    	let a6;
    	let div3;
    	let fainstagram;
    	let t13;
    	let a7;
    	let div4;
    	let fafacebook;
    	let current;
    	let mounted;
    	let dispose;
    	falinkedin = new FaLinkedin({ props: { size: 20 }, $$inline: true });
    	fainstagram = new FaInstagram({ props: { size: 20 }, $$inline: true });
    	fafacebook = new FaFacebook({ props: { size: 20 }, $$inline: true });

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = `${/*name*/ ctx[1]}`;
    			t1 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t2 = text("Home");
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t4 = text("About");
    			t5 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t6 = text("Services");
    			t7 = space();
    			li3 = element("li");
    			a3 = element("a");
    			t8 = text("Works");
    			t9 = space();
    			li4 = element("li");
    			a4 = element("a");
    			t10 = text("Contact");
    			t11 = space();
    			div5 = element("div");
    			a5 = element("a");
    			div2 = element("div");
    			create_component(falinkedin.$$.fragment);
    			t12 = space();
    			a6 = element("a");
    			div3 = element("div");
    			create_component(fainstagram.$$.fragment);
    			t13 = space();
    			a7 = element("a");
    			div4 = element("div");
    			create_component(fafacebook.$$.fragment);
    			add_location(h3, file$1, 13, 6, 315);
    			attr_dev(div0, "class", "uname svelte-bqdn1d");
    			add_location(div0, file$1, 12, 4, 288);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", a0_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'home' ? 'active' : '') + " svelte-bqdn1d");
    			add_location(a0, file$1, 18, 10, 421);
    			attr_dev(li0, "class", "svelte-bqdn1d");
    			add_location(li0, file$1, 17, 8, 405);
    			attr_dev(a1, "href", "/about/");
    			attr_dev(a1, "class", a1_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'about' ? 'active' : '') + " svelte-bqdn1d");
    			add_location(a1, file$1, 21, 10, 587);
    			attr_dev(li1, "class", "svelte-bqdn1d");
    			add_location(li1, file$1, 20, 8, 571);
    			attr_dev(a2, "href", "/service/");
    			attr_dev(a2, "class", a2_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'service' ? 'active' : '') + " svelte-bqdn1d");
    			add_location(a2, file$1, 24, 10, 759);
    			attr_dev(li2, "class", "svelte-bqdn1d");
    			add_location(li2, file$1, 23, 8, 743);
    			attr_dev(a3, "href", "/works/");
    			attr_dev(a3, "class", a3_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'works' ? 'active' : '') + " svelte-bqdn1d");
    			add_location(a3, file$1, 27, 10, 940);
    			attr_dev(li3, "class", "svelte-bqdn1d");
    			add_location(li3, file$1, 26, 8, 924);
    			attr_dev(a4, "href", "/contact/");
    			attr_dev(a4, "class", a4_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'contact' ? 'active' : '') + " svelte-bqdn1d");
    			add_location(a4, file$1, 30, 10, 1112);
    			attr_dev(li4, "class", "svelte-bqdn1d");
    			add_location(li4, file$1, 29, 8, 1096);
    			attr_dev(ul, "class", "items svelte-bqdn1d");
    			add_location(ul, file$1, 16, 6, 377);
    			attr_dev(div1, "class", "sidenav svelte-bqdn1d");
    			add_location(div1, file$1, 15, 4, 348);
    			attr_dev(div2, "class", "icon svelte-bqdn1d");
    			add_location(div2, file$1, 35, 67, 1390);
    			attr_dev(a5, "href", "https://www.linkedin.com/in/ramesh-kannan-247076170/");
    			add_location(a5, file$1, 35, 4, 1327);
    			attr_dev(div3, "class", "icon svelte-bqdn1d");
    			add_location(div3, file$1, 36, 59, 1504);
    			attr_dev(a6, "href", "https://www.instagram.com/nrk_kannan_ramesh/");
    			add_location(a6, file$1, 36, 4, 1449);
    			attr_dev(div4, "class", "icon svelte-bqdn1d");
    			add_location(div4, file$1, 37, 18, 1577);
    			attr_dev(a7, "href", "#hh");
    			add_location(a7, file$1, 37, 4, 1563);
    			attr_dev(div5, "class", "social-media svelte-bqdn1d");
    			add_location(div5, file$1, 34, 2, 1295);
    			attr_dev(div6, "class", "sidebar svelte-bqdn1d");
    			add_location(div6, file$1, 11, 0, 261);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div0, h3);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(a3, t8);
    			append_dev(ul, t9);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, t10);
    			append_dev(div6, t11);
    			append_dev(div6, div5);
    			append_dev(div5, a5);
    			append_dev(a5, div2);
    			mount_component(falinkedin, div2, null);
    			append_dev(div5, t12);
    			append_dev(div5, a6);
    			append_dev(a6, div3);
    			mount_component(fainstagram, div3, null);
    			append_dev(div5, t13);
    			append_dev(div5, a7);
    			append_dev(a7, div4);
    			mount_component(fafacebook, div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[3], false, false, false, false),
    					action_destroyer(link.call(null, a0)),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[4], false, false, false, false),
    					action_destroyer(link.call(null, a1)),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[5], false, false, false, false),
    					action_destroyer(link.call(null, a2)),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[6], false, false, false, false),
    					action_destroyer(link.call(null, a3)),
    					listen_dev(a4, "click", /*click_handler_4*/ ctx[7], false, false, false, false),
    					action_destroyer(link.call(null, a4))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*activePage*/ 1 && a0_class_value !== (a0_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'home' ? 'active' : '') + " svelte-bqdn1d")) {
    				attr_dev(a0, "class", a0_class_value);
    			}

    			if (!current || dirty & /*activePage*/ 1 && a1_class_value !== (a1_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'about' ? 'active' : '') + " svelte-bqdn1d")) {
    				attr_dev(a1, "class", a1_class_value);
    			}

    			if (!current || dirty & /*activePage*/ 1 && a2_class_value !== (a2_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'service' ? 'active' : '') + " svelte-bqdn1d")) {
    				attr_dev(a2, "class", a2_class_value);
    			}

    			if (!current || dirty & /*activePage*/ 1 && a3_class_value !== (a3_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'works' ? 'active' : '') + " svelte-bqdn1d")) {
    				attr_dev(a3, "class", a3_class_value);
    			}

    			if (!current || dirty & /*activePage*/ 1 && a4_class_value !== (a4_class_value = "menu-item " + (/*activePage*/ ctx[0] === 'contact' ? 'active' : '') + " svelte-bqdn1d")) {
    				attr_dev(a4, "class", a4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(falinkedin.$$.fragment, local);
    			transition_in(fainstagram.$$.fragment, local);
    			transition_in(fafacebook.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(falinkedin.$$.fragment, local);
    			transition_out(fainstagram.$$.fragment, local);
    			transition_out(fafacebook.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(falinkedin);
    			destroy_component(fainstagram);
    			destroy_component(fafacebook);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SideBar', slots, []);
    	let name = "Ramesh.";
    	let activePage = 'home';

    	const handleClick = page => {
    		$$invalidate(0, activePage = page);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SideBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClick('home');
    	const click_handler_1 = () => handleClick('about');
    	const click_handler_2 = () => handleClick('service');
    	const click_handler_3 = () => handleClick('works');
    	const click_handler_4 = () => handleClick('contact');

    	$$self.$capture_state = () => ({
    		link,
    		FaLinkedin,
    		FaInstagram,
    		FaFacebook,
    		name,
    		activePage,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('activePage' in $$props) $$invalidate(0, activePage = $$props.activePage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		activePage,
    		name,
    		handleClick,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class SideBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideBar",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div2;
    	let div0;
    	let sidebar;
    	let t;
    	let div1;
    	let router;
    	let current;
    	sidebar = new SideBar({ $$inline: true });
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(sidebar.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(div0, "class", "nav svelte-1igg9lg");
    			add_location(div0, file, 7, 2, 167);
    			attr_dev(div1, "class", "content svelte-1igg9lg");
    			add_location(div1, file, 10, 2, 211);
    			attr_dev(div2, "class", "container svelte-1igg9lg");
    			add_location(div2, file, 6, 1, 141);
    			add_location(main, file, 5, 0, 133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			mount_component(sidebar, div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(router, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(sidebar);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, routes, SideBar });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
