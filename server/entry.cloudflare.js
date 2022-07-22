"use strict";
function _interopNamespace(e2) {
  if (e2 && e2.__esModule)
    return e2;
  var n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e2) {
    Object.keys(e2).forEach(function(k) {
      if (k !== "default") {
        var d2 = Object.getOwnPropertyDescriptor(e2, k);
        Object.defineProperty(n, k, d2.get ? d2 : {
          enumerable: true,
          get: function() {
            return e2[k];
          }
        });
      }
    });
  }
  n["default"] = e2;
  return Object.freeze(n);
}
/**
 * @license
 * @builder.io/qwik
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
const qTest = globalThis.describe !== void 0;
const EMPTY_ARRAY$1 = [];
const EMPTY_OBJ$1 = {};
{
  Object.freeze(EMPTY_ARRAY$1);
  Object.freeze(EMPTY_OBJ$1);
}
const STYLE$1 = `background: #564CE0; color: white; padding: 2px 3px; border-radius: 2px; font-size: 0.8em;`;
const logError$1 = (message, ...optionalParams) => {
  console.error("%cQWIK ERROR", STYLE$1, message, ...optionalParams);
};
const logWarn = (message, ...optionalParams) => {
  console.warn("%cQWIK WARN", STYLE$1, message, ...optionalParams);
};
const logDebug = (message, ...optionalParams) => {
  {
    console.debug("%cQWIK", STYLE$1, message, ...optionalParams);
  }
};
function assertDefined$1(value, text) {
  {
    if (value != null)
      return;
    throw newError$1(text || "Expected defined value.");
  }
}
function assertEqual(value1, value2, text) {
  {
    if (value1 === value2)
      return;
    throw newError$1(text || `Expected '${value1}' === '${value2}'.`);
  }
}
function newError$1(text) {
  debugger;
  const error = new Error(text);
  logError$1(error);
  return error;
}
const QHostAttr = "q:host";
const OnRenderProp = "q:renderFn";
const ComponentScopedStyles = "q:sstyle";
const ComponentStylesPrefixHost = "\u{1F48E}";
const ComponentStylesPrefixContent = "\u2B50\uFE0F";
const QSlotAttr = "q:slot";
const QObjAttr = "q:obj";
const QSeqAttr = "q:seq";
const QContainerAttr = "q:container";
const QContainerSelector = "[q\\:container]";
const RenderEvent = "qRender";
const ELEMENT_ID = "q:id";
const ELEMENT_ID_PREFIX = "#";
function getDocument$1(node) {
  if (typeof document !== "undefined") {
    return document;
  }
  if (node.nodeType === 9) {
    return node;
  }
  let doc = node.ownerDocument;
  while (doc && doc.nodeType !== 9) {
    doc = doc.parentNode;
  }
  assertDefined$1(doc);
  return doc;
}
const CONTAINER = Symbol("container");
function isStyleTask(obj) {
  return obj && typeof obj === "object" && obj.type === "style";
}
let _context;
function tryGetInvokeContext() {
  if (!_context) {
    const context = typeof document !== "undefined" && document && document.__q_context__;
    if (!context) {
      return void 0;
    }
    if (Array.isArray(context)) {
      const element = context[0];
      const hostElement = getHostElement(element);
      assertDefined$1(element);
      return document.__q_context__ = newInvokeContext(getDocument$1(element), hostElement, element, context[1], context[2]);
    }
    return context;
  }
  return _context;
}
function getInvokeContext() {
  const ctx = tryGetInvokeContext();
  if (!ctx) {
    throw new Error("Q-ERROR: invoking 'use*()' method outside of invocation context.");
  }
  return ctx;
}
function useInvoke(context, fn, ...args) {
  const previousContext = _context;
  let returnValue;
  try {
    _context = context;
    returnValue = fn.apply(null, args);
  } finally {
    const currentCtx = _context;
    _context = previousContext;
    if (currentCtx.waitOn && currentCtx.waitOn.length > 0) {
      return Promise.all(currentCtx.waitOn).then(() => returnValue);
    }
  }
  return returnValue;
}
function newInvokeContext(doc, hostElement, element, event, url) {
  return {
    seq: 0,
    doc,
    hostElement,
    element,
    event,
    url: url || null,
    qrl: void 0
  };
}
function getHostElement(el) {
  let foundSlot = false;
  let node = el;
  while (node) {
    const isHost = node.hasAttribute(QHostAttr);
    const isSlot = node.tagName === "Q:SLOT";
    if (isHost) {
      if (!foundSlot) {
        break;
      } else {
        foundSlot = false;
      }
    }
    if (isSlot) {
      foundSlot = true;
    }
    node = node.parentElement;
  }
  return node;
}
function getContainer(el) {
  let container = el[CONTAINER];
  if (!container) {
    container = el.closest(QContainerSelector);
    el[CONTAINER] = container;
  }
  return container;
}
function isPromise(value) {
  return value instanceof Promise;
}
const then = (promise, thenFn) => {
  return isPromise(promise) ? promise.then(thenFn) : thenFn(promise);
};
const promiseAll = (promises) => {
  const hasPromise = promises.some(isPromise);
  if (hasPromise) {
    return Promise.all(promises);
  }
  return promises;
};
function isQrl(value) {
  return value instanceof QRLInternal;
}
class QRL {
  constructor(chunk, symbol, symbolRef, symbolFn, capture, captureRef) {
    this.chunk = chunk;
    this.symbol = symbol;
    this.symbolRef = symbolRef;
    this.symbolFn = symbolFn;
    this.capture = capture;
    this.captureRef = captureRef;
    this.canonicalChunk = chunk.replace(FIND_EXT, "");
  }
  setContainer(el) {
    if (!this.el) {
      this.el = el;
    }
  }
  async resolve(el) {
    if (el) {
      this.setContainer(el);
    }
    return qrlImport(this.el, this);
  }
  invokeFn(el, currentCtx) {
    return (...args) => {
      const fn = typeof this.symbolRef === "function" ? this.symbolRef : this.resolve(el);
      return then(fn, (fn2) => {
        if (typeof fn2 === "function") {
          const baseContext = currentCtx != null ? currentCtx : newInvokeContext();
          const context = {
            ...baseContext,
            qrl: this
          };
          return useInvoke(context, fn2, ...args);
        }
        throw new Error("QRL is not a function");
      });
    };
  }
  copy() {
    return new QRLInternal(this.chunk, this.symbol, this.symbolRef, this.symbolFn, null, this.captureRef);
  }
  invoke(...args) {
    const fn = this.invokeFn();
    return fn(...args);
  }
  serialize(options) {
    return stringifyQRL(this, options);
  }
}
const QRLInternal = QRL;
const FIND_EXT = /\?[\w=&]+$/;
const createPlatform$1 = (doc) => {
  const moduleCache = /* @__PURE__ */ new Map();
  return {
    importSymbol(element, url, symbolName) {
      const urlDoc = toUrl(doc, element, url).toString();
      const urlCopy = new URL(urlDoc);
      urlCopy.hash = "";
      urlCopy.search = "";
      const importURL = urlCopy.href;
      const mod = moduleCache.get(importURL);
      if (mod) {
        return mod[symbolName];
      }
      return function(t) {
        return Promise.resolve().then(function() {
          return /* @__PURE__ */ _interopNamespace(require(t));
        });
      }(importURL).then((mod2) => {
        moduleCache.set(importURL, mod2);
        return mod2[symbolName];
      });
    },
    raf: (fn) => {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve(fn());
        });
      });
    },
    nextTick: (fn) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fn());
        });
      });
    },
    chunkForSymbol() {
      return void 0;
    }
  };
};
function toUrl(doc, element, url) {
  var _a;
  const containerEl = getContainer(element);
  const base = new URL((_a = containerEl == null ? void 0 : containerEl.getAttribute("q:base")) != null ? _a : doc.baseURI, doc.baseURI);
  return new URL(url, base);
}
const setPlatform = (doc, plt) => doc[DocumentPlatform] = plt;
const getPlatform = (docOrNode) => {
  const doc = getDocument$1(docOrNode);
  return doc[DocumentPlatform] || (doc[DocumentPlatform] = createPlatform$1(doc));
};
const DocumentPlatform = /* @__PURE__ */ Symbol();
function isHtmlElement(node) {
  return node ? node.nodeType === NodeType.ELEMENT_NODE : false;
}
var NodeType;
(function(NodeType2) {
  NodeType2[NodeType2["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
  NodeType2[NodeType2["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
  NodeType2[NodeType2["TEXT_NODE"] = 3] = "TEXT_NODE";
  NodeType2[NodeType2["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
  NodeType2[NodeType2["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
  NodeType2[NodeType2["COMMENT_NODE"] = 8] = "COMMENT_NODE";
  NodeType2[NodeType2["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
  NodeType2[NodeType2["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
  NodeType2[NodeType2["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
})(NodeType || (NodeType = {}));
function stringifyDebug(value) {
  if (value == null)
    return String(value);
  if (typeof value === "function")
    return value.name;
  if (isHtmlElement(value))
    return stringifyElement(value);
  if (value instanceof URL)
    return String(value);
  if (typeof value === "object")
    return JSON.stringify(value, function(key, value2) {
      if (isHtmlElement(value2))
        return stringifyElement(value2);
      return value2;
    });
  return String(value);
}
function stringifyElement(element) {
  let html = "<" + element.localName;
  const attributes = element.attributes;
  const names = [];
  for (let i = 0; i < attributes.length; i++) {
    names.push(attributes[i].name);
  }
  names.sort();
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    let value = element.getAttribute(name);
    if (value == null ? void 0 : value.startsWith("file:/")) {
      value = value.replace(/(file:\/\/).*(\/.*)$/, (all, protocol, file) => protocol + "..." + file);
    }
    html += " " + name + (value == null || value == "" ? "" : "='" + value.replace("'", "&apos;") + "'");
  }
  return html + ">";
}
var QError;
(function(QError2) {
  QError2[QError2["TODO"] = 0] = "TODO";
  QError2[QError2["Core_qConfigNotFound_path"] = 1] = "Core_qConfigNotFound_path";
  QError2[QError2["Core_unrecognizedStack_frame"] = 2] = "Core_unrecognizedStack_frame";
  QError2[QError2["Core_noAttribute_atr1_element"] = 3] = "Core_noAttribute_atr1_element";
  QError2[QError2["Core_noAttribute_atr1_attr2_element"] = 4] = "Core_noAttribute_atr1_attr2_element";
  QError2[QError2["Core_missingProperty_name_props"] = 5] = "Core_missingProperty_name_props";
  QError2[QError2["Core_missingExport_name_url_props"] = 6] = "Core_missingExport_name_url_props";
  QError2[QError2["QRL_expectFunction_url_actual"] = 100] = "QRL_expectFunction_url_actual";
  QError2[QError2["Injector_noHost_element"] = 200] = "Injector_noHost_element";
  QError2[QError2["Injector_expectedSpecificInjector_expected_actual"] = 201] = "Injector_expectedSpecificInjector_expected_actual";
  QError2[QError2["Injector_notElement_arg"] = 202] = "Injector_notElement_arg";
  QError2[QError2["Injector_wrongMethodThis_expected_actual"] = 203] = "Injector_wrongMethodThis_expected_actual";
  QError2[QError2["Injector_missingSerializedState_entityKey_element"] = 204] = "Injector_missingSerializedState_entityKey_element";
  QError2[QError2["Injector_notFound_element"] = 206] = "Injector_notFound_element";
  QError2[QError2["Injector_eventInjectorNotSerializable"] = 207] = "Injector_eventInjectorNotSerializable";
  QError2[QError2["Entity_notValidKey_key"] = 300] = "Entity_notValidKey_key";
  QError2[QError2["Entity_keyAlreadyExists_key"] = 301] = "Entity_keyAlreadyExists_key";
  QError2[QError2["Entity_invalidAttribute_name"] = 303] = "Entity_invalidAttribute_name";
  QError2[QError2["Entity_missingExpandoOrState_attrName"] = 304] = "Entity_missingExpandoOrState_attrName";
  QError2[QError2["Entity_elementMissingEntityAttr_element_attr"] = 305] = "Entity_elementMissingEntityAttr_element_attr";
  QError2[QError2["Entity_noState_entity_props"] = 306] = "Entity_noState_entity_props";
  QError2[QError2["Entity_expected_obj"] = 307] = "Entity_expected_obj";
  QError2[QError2["Entity_overridesConstructor_entity"] = 308] = "Entity_overridesConstructor_entity";
  QError2[QError2["Entity_keyMissingParts_key_key"] = 309] = "Entity_keyMissingParts_key_key";
  QError2[QError2["Entity_no$type_entity"] = 310] = "Entity_no$type_entity";
  QError2[QError2["Entity_no$keyProps_entity"] = 311] = "Entity_no$keyProps_entity";
  QError2[QError2["Entity_no$qrl_entity"] = 312] = "Entity_no$qrl_entity";
  QError2[QError2["Entity_nameCollision_name_currentQrl_expectedQrl"] = 313] = "Entity_nameCollision_name_currentQrl_expectedQrl";
  QError2[QError2["Entity_keyTooManyParts_entity_parts_key"] = 314] = "Entity_keyTooManyParts_entity_parts_key";
  QError2[QError2["Entity_keyNameMismatch_key_name_entity_name"] = 315] = "Entity_keyNameMismatch_key_name_entity_name";
  QError2[QError2["Entity_stateMissingKey_state"] = 316] = "Entity_stateMissingKey_state";
  QError2[QError2["Component_bindNeedsKey"] = 400] = "Component_bindNeedsKey";
  QError2[QError2["Component_bindNeedsValue"] = 401] = "Component_bindNeedsValue";
  QError2[QError2["Component_needsState"] = 402] = "Component_needsState";
  QError2[QError2["Component_needsInjectionContext_constructor"] = 403] = "Component_needsInjectionContext_constructor";
  QError2[QError2["Component_noProperty_propName_props_host"] = 404] = "Component_noProperty_propName_props_host";
  QError2[QError2["Component_notFound_component"] = 405] = "Component_notFound_component";
  QError2[QError2["Component_doesNotMatch_component_actual"] = 406] = "Component_doesNotMatch_component_actual";
  QError2[QError2["Component_noState_component_props"] = 408] = "Component_noState_component_props";
  QError2[QError2["Provider_unrecognizedFormat_value"] = 500] = "Provider_unrecognizedFormat_value";
  QError2[QError2["Render_unexpectedJSXNodeType_type"] = 600] = "Render_unexpectedJSXNodeType_type";
  QError2[QError2["Render_unsupportedFormat_obj_attr"] = 601] = "Render_unsupportedFormat_obj_attr";
  QError2[QError2["Render_expectingEntity_entity"] = 602] = "Render_expectingEntity_entity";
  QError2[QError2["Render_expectingEntityArray_obj"] = 603] = "Render_expectingEntityArray_obj";
  QError2[QError2["Render_expectingEntityOrComponent_obj"] = 604] = "Render_expectingEntityOrComponent_obj";
  QError2[QError2["Render_stateMachineStuck"] = 699] = "Render_stateMachineStuck";
  QError2[QError2["Event_emitEventRequiresName_url"] = 700] = "Event_emitEventRequiresName_url";
  QError2[QError2["Event_emitEventCouldNotFindListener_event_element"] = 701] = "Event_emitEventCouldNotFindListener_event_element";
})(QError || (QError = {}));
function qError(code, ...args) {
  {
    const text = codeToText(code);
    const parts = text.split("{}");
    const error = parts.map((value, index) => {
      return value + (index === parts.length - 1 ? "" : stringifyDebug(args[index]));
    }).join("");
    debugger;
    return new Error(error);
  }
}
function codeToText(code) {
  const area = {
    0: "ERROR",
    1: "QRL-ERROR",
    2: "INJECTOR-ERROR",
    3: "SERVICE-ERROR",
    4: "COMPONENT-ERROR",
    5: "PROVIDER-ERROR",
    6: "RENDER-ERROR",
    7: "EVENT-ERROR"
  }[Math.floor(code / 100)];
  const text = {
    [QError.TODO]: "{}",
    [QError.Core_qConfigNotFound_path]: "QConfig not found in path '{}'.",
    [QError.Core_unrecognizedStack_frame]: "Unrecognized stack format '{}'",
    [QError.Core_noAttribute_atr1_element]: "Could not find entity state '{}' at '{}' or any of it's parents.",
    [QError.Core_noAttribute_atr1_attr2_element]: "Could not find entity state '{}' ( or entity provider '{}') at '{}' or any of it's parents.",
    [QError.Core_missingProperty_name_props]: "Missing property '{}' in props '{}'.",
    [QError.Core_missingExport_name_url_props]: "Missing export '{}' from '{}'. Exported symbols are: {}",
    [QError.QRL_expectFunction_url_actual]: "QRL '${}' should point to function, was '{}'.",
    [QError.Injector_noHost_element]: "Can't find host element above '{}'.",
    [QError.Injector_expectedSpecificInjector_expected_actual]: "Provider is expecting '{}' but got '{}'.",
    [QError.Injector_notElement_arg]: "Expected 'Element' was '{}'.",
    [QError.Injector_wrongMethodThis_expected_actual]: "Expected injection 'this' to be of type '{}', but was of type '{}'.",
    [QError.Injector_missingSerializedState_entityKey_element]: "Entity key '{}' is found on '{}' but does not contain state. Was 'serializeState()' not run during dehydration?",
    [QError.Injector_notFound_element]: "No injector can be found starting at '{}'.",
    [QError.Injector_eventInjectorNotSerializable]: "EventInjector does not support serialization.",
    [QError.Entity_notValidKey_key]: "Data key '{}' is not a valid key.\n  - Data key can only contain characters (preferably lowercase) or number\n  - Data key is prefixed with entity name\n  - Data key is made up from parts that are separated with ':'.",
    [QError.Entity_keyAlreadyExists_key]: "A entity with key '{}' already exists.",
    [QError.Entity_invalidAttribute_name]: "'{}' is not a valid attribute. Attributes can only contain 'a-z' (lowercase), '0-9', '-' and '_'.",
    [QError.Entity_missingExpandoOrState_attrName]: "Found '{}' but expando did not have entity and attribute did not have state.",
    [QError.Entity_elementMissingEntityAttr_element_attr]: "Element '{}' is missing entity attribute definition '{}'.",
    [QError.Entity_noState_entity_props]: "Unable to create state for entity '{}' with props '{}' because no state found and '$newState()' method was not defined on entity.",
    [QError.Entity_expected_obj]: "'{}' is not an instance of 'Entity'.",
    [QError.Entity_overridesConstructor_entity]: "'{}' overrides 'constructor' property preventing 'EntityType' retrieval.",
    [QError.Entity_no$keyProps_entity]: "Entity '{}' does not define '$keyProps'.",
    [QError.Entity_no$type_entity]: "Entity '{}' must have static '$type' property defining the name of the entity.",
    [QError.Entity_no$qrl_entity]: "Entity '{}' must have static '$qrl' property defining the import location of the entity.",
    [QError.Entity_nameCollision_name_currentQrl_expectedQrl]: "Name collision. Already have entity named '{}' with QRL '{}' but expected QRL '{}'.",
    [QError.Entity_keyMissingParts_key_key]: "Entity key '{}' is missing values. Expecting '{}:someValue'.",
    [QError.Entity_keyTooManyParts_entity_parts_key]: "Entity '{}' defines '$keyProps' as  '{}'. Actual key '{}' has more parts than entity defines.",
    [QError.Entity_keyNameMismatch_key_name_entity_name]: "Key '{}' belongs to entity named '{}', but expected entity '{}' with name '{}'.",
    [QError.Entity_stateMissingKey_state]: "Entity state is missing '$key'. Are you sure you passed in state? Got '{}'.",
    [QError.Component_bindNeedsKey]: `'bind:' must have an key. (Example: 'bind:key="propertyName"').`,
    [QError.Component_bindNeedsValue]: `'bind:id' must have a property name. (Example: 'bind:key="propertyName"').`,
    [QError.Component_needsState]: "Can't find state on host element.",
    [QError.Component_needsInjectionContext_constructor]: "Components must be instantiated inside an injection context. Use '{}.new(...)' for creation.",
    [QError.Component_noProperty_propName_props_host]: "Property '{}' not found in '{}' on component '{}'.",
    [QError.Component_notFound_component]: "Unable to find '{}' component.",
    [QError.Component_doesNotMatch_component_actual]: "Requesting component type '{}' does not match existing component instance '{}'.",
    [QError.Component_noState_component_props]: "Unable to create state for component '{}' with props '{}' because no state found and '$newState()' method was not defined on component.",
    [QError.Provider_unrecognizedFormat_value]: "Unrecognized expression format '{}'.",
    [QError.Render_unexpectedJSXNodeType_type]: "Unexpected JSXNode<{}> type.",
    [QError.Render_unsupportedFormat_obj_attr]: "Value '{}' can't be written into '{}' attribute.",
    [QError.Render_expectingEntity_entity]: "Expecting entity object, got '{}'.",
    [QError.Render_expectingEntityArray_obj]: "Expecting array of entities, got '{}'.",
    [QError.Render_expectingEntityOrComponent_obj]: "Expecting Entity or Component got '{}'.",
    [QError.Render_stateMachineStuck]: "Render state machine did not advance.",
    [QError.Event_emitEventRequiresName_url]: "Missing '$type' attribute in the '{}' url.",
    [QError.Event_emitEventCouldNotFindListener_event_element]: "Re-emitting event '{}' but no listener found at '{}' or any of its parents."
  }[code];
  let textCode = "000" + code;
  textCode = textCode.slice(-3);
  return `${area}(Q-${textCode}): ${text}`;
}
function isNode$1(value) {
  return value && typeof value.nodeType == "number";
}
function isDocument$1(value) {
  return value && value.nodeType == NodeType.DOCUMENT_NODE;
}
function isElement(value) {
  return isNode$1(value) && value.nodeType == NodeType.ELEMENT_NODE;
}
const UNDEFINED_PREFIX = "";
const QRL_PREFIX = "";
function resumeContainer(containerEl) {
  if (!isContainer(containerEl)) {
    logWarn("Skipping hydration because parent element is not q:container");
    return;
  }
  const doc = getDocument$1(containerEl);
  const isDocElement = containerEl === doc.documentElement;
  const parentJSON = isDocElement ? doc.body : containerEl;
  const script = getQwikJSON(parentJSON);
  if (!script) {
    logWarn("Skipping hydration qwik/json metadata was not found.");
    return;
  }
  script.remove();
  const map = getProxyMap(doc);
  const meta = JSON.parse(script.textContent || "{}");
  const elements = /* @__PURE__ */ new Map();
  getNodesInScope(containerEl, hasQId).forEach((el) => {
    const id = el.getAttribute(ELEMENT_ID);
    elements.set(ELEMENT_ID_PREFIX + id, el);
  });
  const getObject = (id) => {
    return getObjectImpl(id, elements, meta.objs, map);
  };
  reviveValues(meta.objs, meta.subs, getObject, map, parentJSON);
  for (const obj of meta.objs) {
    reviveNestedObjects(obj, getObject);
  }
  getNodesInScope(containerEl, hasQObj).forEach((el) => {
    const qobj = el.getAttribute(QObjAttr);
    const seq = el.getAttribute(QSeqAttr);
    const host = el.getAttribute(QHostAttr);
    const ctx = getContext(el);
    qobj.split(" ").forEach((part) => {
      if (part !== "") {
        const obj = getObject(part);
        ctx.refMap.add(obj);
      } else {
        logError$1("QObj contains empty ref");
      }
    });
    ctx.seq = seq.split(" ").map((part) => strToInt(part));
    if (host) {
      const [props, renderQrl] = host.split(" ").map(strToInt);
      assertDefined$1(props);
      assertDefined$1(renderQrl);
      ctx.props = ctx.refMap.get(props);
      ctx.renderQrl = ctx.refMap.get(renderQrl);
    }
  });
  containerEl.setAttribute(QContainerAttr, "resumed");
  logDebug("Container resumed");
}
function snapshotState(containerEl) {
  const doc = getDocument$1(containerEl);
  const proxyMap = getProxyMap(doc);
  const objSet = /* @__PURE__ */ new Set();
  const platform = getPlatform(doc);
  const elementToIndex = /* @__PURE__ */ new Map();
  const elements = getNodesInScope(containerEl, hasQObj);
  elements.forEach((node) => {
    const props = getContext(node);
    const qMap = props.refMap;
    qMap.array.forEach((v) => {
      collectValue(v, objSet);
    });
  });
  const objs = Array.from(objSet);
  objs.sort((a, b2) => {
    const isProxyA = proxyMap.has(a) ? 0 : 1;
    const isProxyB = proxyMap.has(b2) ? 0 : 1;
    return isProxyA - isProxyB;
  });
  const objToId = /* @__PURE__ */ new Map();
  let count = 0;
  for (const obj of objs) {
    objToId.set(obj, count);
    count++;
  }
  function getElementID(el) {
    let id = elementToIndex.get(el);
    if (id === void 0) {
      if (el.isConnected) {
        id = intToStr(elementToIndex.size);
        el.setAttribute(ELEMENT_ID, id);
        id = ELEMENT_ID_PREFIX + id;
      } else {
        id = null;
      }
      elementToIndex.set(el, id);
    }
    return id;
  }
  function getObjId(obj) {
    if (obj !== null && typeof obj === "object") {
      const target = obj[QOjectTargetSymbol];
      const id = objToId.get(normalizeObj(target != null ? target : obj));
      if (id !== void 0) {
        const proxySuffix = target ? "!" : "";
        return intToStr(id) + proxySuffix;
      }
      if (!target && isElement(obj)) {
        return getElementID(obj);
      }
    } else {
      const id = objToId.get(normalizeObj(obj));
      if (id !== void 0) {
        return intToStr(id);
      }
    }
    return null;
  }
  const subs = objs.map((obj) => {
    var _a;
    const subs2 = (_a = proxyMap.get(obj)) == null ? void 0 : _a[QOjectSubsSymbol];
    if (subs2) {
      return Object.fromEntries(Array.from(subs2.entries()).map(([sub, set]) => {
        const id = getObjId(sub);
        if (id !== null) {
          return [id, Array.from(set)];
        } else {
          return [void 0, void 0];
        }
      }));
    } else {
      return null;
    }
  }).filter((a) => !!a);
  const serialize = (value) => {
    var _a;
    return (_a = getObjId(value)) != null ? _a : value;
  };
  const qrlSerializeOptions = {
    platform,
    getObjId
  };
  const convertedObjs = objs.map((obj) => {
    if (Array.isArray(obj)) {
      return obj.map(serialize);
    } else if (obj && typeof obj === "object") {
      if (isQrl(obj)) {
        return QRL_PREFIX + stringifyQRL(obj, qrlSerializeOptions);
      }
      const output = {};
      Object.entries(obj).forEach(([key, value]) => {
        output[key] = serialize(value);
      });
      return output;
    }
    return obj;
  });
  elements.forEach((node) => {
    const ctx = getContext(node);
    const props = ctx.props;
    const renderQrl = ctx.renderQrl;
    const attribute = ctx.refMap.array.map((obj) => {
      const id = getObjId(obj);
      assertDefined$1(id);
      return id;
    }).join(" ");
    node.setAttribute(QObjAttr, attribute);
    const seq = ctx.seq.map((index) => intToStr(index)).join(" ");
    node.setAttribute(QSeqAttr, seq);
    if (props) {
      const objs2 = [props];
      if (renderQrl) {
        objs2.push(renderQrl);
      }
      node.setAttribute(QHostAttr, objs2.map((obj) => ctx.refMap.indexOf(obj)).join(" "));
    }
  });
  {
    elementToIndex.forEach((value, el) => {
      if (getDocument$1(el) !== doc) {
        logWarn("element from different document", value, el.tagName);
      }
      if (!value) {
        logWarn("unconnected element", el.tagName, "\n");
      }
    });
  }
  return {
    objs: convertedObjs,
    subs
  };
}
function getQwikJSON(parentElm) {
  let child = parentElm.lastElementChild;
  while (child) {
    if (child.tagName === "SCRIPT" && child.getAttribute("type") === "qwik/json") {
      return child;
    }
    child = child.previousElementSibling;
  }
  return void 0;
}
function getNodesInScope(parent, predicate) {
  const nodes = [];
  walkNodes(nodes, parent, predicate);
  return nodes;
}
function walkNodes(nodes, parent, predicate) {
  let child = parent.firstElementChild;
  while (child) {
    if (!isContainer(child)) {
      if (predicate(child)) {
        nodes.push(child);
      }
      walkNodes(nodes, child, predicate);
    }
    child = child.nextElementSibling;
  }
}
function reviveValues(objs, subs, getObject, map, containerEl) {
  for (let i = 0; i < objs.length; i++) {
    const value = objs[i];
    if (typeof value === "string") {
      if (value === UNDEFINED_PREFIX) {
        objs[i] = void 0;
      } else if (value.startsWith(QRL_PREFIX)) {
        objs[i] = parseQRL(value.slice(1), containerEl);
      }
    } else {
      const sub = subs[i];
      if (sub) {
        const converted = /* @__PURE__ */ new Map();
        Object.entries(sub).forEach((entry) => {
          const el = getObject(entry[0]);
          if (!el) {
            logWarn("QWIK can not revive subscriptions because of missing element ID", entry, value);
            return;
          }
          const set = new Set(entry[1]);
          converted.set(el, set);
        });
        _restoreQObject(value, map, converted);
      }
    }
  }
}
function reviveNestedObjects(obj, getObject) {
  if (obj && typeof obj == "object") {
    if (isQrl(obj)) {
      if (obj.capture && obj.capture.length > 0) {
        obj.captureRef = obj.capture.map(getObject);
        obj.capture = null;
      }
      return;
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];
        if (typeof value == "string") {
          obj[i] = getObject(value);
        } else {
          reviveNestedObjects(value, getObject);
        }
      }
    } else if (Object.getPrototypeOf(obj) === Object.prototype) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (typeof value == "string") {
            obj[key] = getObject(value);
          } else {
            reviveNestedObjects(value, getObject);
          }
        }
      }
    }
  }
}
function getObjectImpl(id, elements, objs, map) {
  if (id.startsWith(ELEMENT_ID_PREFIX)) {
    assertEqual(elements.has(id), true);
    return elements.get(id);
  }
  const index = strToInt(id);
  assertEqual(objs.length > index, true);
  const obj = objs[index];
  const needsProxy = id.endsWith("!");
  if (needsProxy) {
    const finalObj = map.get(obj);
    assertDefined$1(finalObj);
    return finalObj;
  }
  return obj;
}
function normalizeObj(obj) {
  var _a;
  if (obj === void 0 || !shouldSerialize(obj)) {
    return UNDEFINED_PREFIX;
  }
  if (obj && typeof obj === "object") {
    const value = (_a = obj[QOjectTargetSymbol]) != null ? _a : obj;
    return value;
  }
  return obj;
}
function collectValue(obj, seen) {
  collectQObjects(obj, seen);
  seen.add(normalizeObj(obj));
}
function collectQrl(obj, seen) {
  seen.add(normalizeObj(obj));
  if (obj.captureRef) {
    obj.captureRef.forEach((obj2) => collectValue(obj2, seen));
  }
}
function collectQObjects(obj, seen) {
  if (obj != null) {
    if (typeof obj === "object") {
      if (!obj[QOjectTargetSymbol] && isElement(obj)) {
        return;
      }
      if (isQrl(obj)) {
        collectQrl(obj, seen);
        return;
      }
      obj = normalizeObj(obj);
    }
    if (typeof obj === "object") {
      if (seen.has(obj))
        return;
      seen.add(obj);
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          collectQObjects(obj[i], seen);
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            collectQObjects(obj[key], seen);
          }
        }
      }
    }
    if (typeof obj === "string") {
      seen.add(obj);
    }
  }
}
function isContainer(el) {
  return el.hasAttribute(QContainerAttr);
}
function hasQObj(el) {
  return el.hasAttribute(QObjAttr);
}
function hasQId(el) {
  return el.hasAttribute(ELEMENT_ID);
}
const intToStr = (nu) => {
  return nu.toString(36);
};
const strToInt = (nu) => {
  return parseInt(nu, 36);
};
function newQObjectMap(element) {
  const array = [];
  let added = element.hasAttribute(QObjAttr);
  return {
    array,
    get(index) {
      return array[index];
    },
    indexOf(obj) {
      const index = array.indexOf(obj);
      return index === -1 ? void 0 : index;
    },
    add(object) {
      const index = array.indexOf(object);
      if (index === -1) {
        array.push(object);
        if (!added) {
          element.setAttribute(QObjAttr, "");
          added = true;
        }
        return array.length - 1;
      }
      return index;
    }
  };
}
function qDeflate(obj, hostCtx) {
  return String(hostCtx.refMap.add(obj));
}
function qInflate(ref, hostCtx) {
  const int = parseInt(ref, 10);
  const obj = hostCtx.refMap.get(int);
  assertEqual(hostCtx.refMap.array.length > int, true);
  return obj;
}
function fromCamelToKebabCase(text) {
  return text.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function debugStringify(value) {
  if (value != null && typeof value == "object") {
    return String(value.constructor.name) + "\n" + safeJSONStringify(value);
  }
  return String(value);
}
function safeJSONStringify(value) {
  try {
    return JSON.stringify(value, null, "  ");
  } catch (e2) {
    return String(e2);
  }
}
const ON_PROP_REGEX = /^on([A-Z]|-.).*Qrl$/;
const ON$_PROP_REGEX = /^on([A-Z]|-.).*\$$/;
function isOnProp(prop) {
  return ON_PROP_REGEX.test(prop);
}
function isOn$Prop(prop) {
  return ON$_PROP_REGEX.test(prop);
}
function qPropWriteQRL(rctx, ctx, prop, value) {
  if (!value) {
    return;
  }
  if (typeof value == "string") {
    value = parseQRL(value, ctx.element);
  }
  const existingQRLs = getExistingQRLs(ctx, prop);
  if (Array.isArray(value)) {
    value.forEach((value2) => qPropWriteQRL(rctx, ctx, prop, value2));
  } else if (isQrl(value)) {
    const cp = value.copy();
    cp.setContainer(ctx.element);
    const capture = cp.capture;
    if (capture == null) {
      const captureRef = cp.captureRef;
      cp.capture = captureRef && captureRef.length ? captureRef.map((ref) => qDeflate(ref, ctx)) : EMPTY_ARRAY$1;
    }
    for (let i = 0; i < existingQRLs.length; i++) {
      const qrl2 = existingQRLs[i];
      if (!isPromise(qrl2) && qrl2.canonicalChunk === cp.canonicalChunk && qrl2.symbol === cp.symbol) {
        existingQRLs.splice(i, 1);
        i--;
      }
    }
    existingQRLs.push(cp);
  } else if (isPromise(value)) {
    const writePromise = value.then((qrl2) => {
      existingQRLs.splice(existingQRLs.indexOf(writePromise), 1);
      qPropWriteQRL(rctx, ctx, prop, qrl2);
      return qrl2;
    });
    existingQRLs.push(writePromise);
  } else {
    throw qError(QError.TODO, `Not QRLInternal: prop: ${prop}; value: ` + value);
  }
  const kebabProp = fromCamelToKebabCase(prop);
  const newValue = serializeQRLs(existingQRLs, ctx);
  if (ctx.element.getAttribute(kebabProp) !== newValue) {
    if (rctx) {
      setAttribute(rctx, ctx.element, kebabProp, newValue);
    } else {
      ctx.element.setAttribute(kebabProp, newValue);
    }
  }
}
function getExistingQRLs(ctx, prop) {
  const key = "event:" + prop;
  let parts = ctx.cache.get(key);
  if (!parts) {
    const attrName = fromCamelToKebabCase(prop);
    parts = [];
    (ctx.element.getAttribute(attrName) || "").split("\n").forEach((qrl2) => {
      if (qrl2) {
        parts.push(parseQRL(qrl2, ctx.element));
      }
    });
    ctx.cache.set(key, parts);
  }
  return parts;
}
function serializeQRLs(existingQRLs, ctx) {
  const platform = getPlatform(getDocument$1(ctx.element));
  const element = ctx.element;
  const opts = {
    platform,
    element
  };
  return existingQRLs.map((qrl2) => isPromise(qrl2) ? "" : stringifyQRL(qrl2, opts)).filter((v) => !!v).join("\n");
}
Error.stackTraceLimit = 9999;
const Q_CTX = "__ctx__";
function resumeIfNeeded(containerEl) {
  const isResumed = containerEl.getAttribute(QContainerAttr);
  if (isResumed === "paused") {
    resumeContainer(containerEl);
  }
}
function getContext(element) {
  let ctx = element[Q_CTX];
  if (!ctx) {
    const cache = /* @__PURE__ */ new Map();
    element[Q_CTX] = ctx = {
      element,
      cache,
      refMap: newQObjectMap(element),
      dirty: false,
      seq: [],
      props: void 0,
      renderQrl: void 0,
      component: void 0
    };
  }
  return ctx;
}
const PREFIXES = ["onWindow", "onWindow", "on"];
function normalizeOnProp(prop) {
  let scope = "on";
  for (const prefix of PREFIXES) {
    if (prop.startsWith(prefix)) {
      scope = prefix;
      prop = prop.slice(prefix.length);
    }
  }
  if (prop.startsWith("-")) {
    prop = prop.slice(1);
  } else {
    prop = prop.toLowerCase();
  }
  return `${scope}:${prop}`;
}
function setEvent(rctx, ctx, prop, value) {
  qPropWriteQRL(rctx, ctx, normalizeOnProp(prop), value);
}
function getProps(ctx) {
  if (!ctx.props) {
    ctx.props = readWriteProxy({}, getProxyMap(getDocument$1(ctx.element)));
    ctx.refMap.add(ctx.props);
  }
  return ctx.props;
}
const Host = { __brand__: "host" };
const SkipRerender = { __brand__: "skip" };
function $(expression) {
  return runtimeQrl(expression);
}
function visitJsxNode(ctx, elm, jsxNode, isSvg) {
  if (jsxNode === void 0) {
    return smartUpdateChildren(ctx, elm, [], "root", isSvg);
  }
  if (Array.isArray(jsxNode)) {
    return smartUpdateChildren(ctx, elm, jsxNode.flat(), "root", isSvg);
  } else if (jsxNode.type === Host) {
    updateProperties(ctx, getContext(elm), jsxNode.props, isSvg);
    return smartUpdateChildren(ctx, elm, jsxNode.children || [], "root", isSvg);
  } else {
    return smartUpdateChildren(ctx, elm, [jsxNode], "root", isSvg);
  }
}
function styleHost(styleId) {
  return styleId && ComponentStylesPrefixHost + styleId;
}
function styleContent(styleId) {
  return styleId && ComponentStylesPrefixContent + styleId;
}
function jsx(type, props, key) {
  return new JSXNodeImpl(type, props, key);
}
class JSXNodeImpl {
  constructor(type, props, key = null) {
    this.type = type;
    this.props = props;
    this.children = EMPTY_ARRAY$1;
    this.text = void 0;
    this.key = null;
    if (key != null) {
      this.key = String(key);
    }
    if (props) {
      const children = processNode(props.children);
      if (children !== void 0) {
        if (Array.isArray(children)) {
          this.children = children;
        } else {
          this.children = [children];
        }
      }
    }
  }
}
function processNode(node) {
  if (node == null || typeof node === "boolean") {
    return void 0;
  }
  if (isJSXNode(node)) {
    if (node.type === Host || node.type === SkipRerender) {
      return node;
    } else if (typeof node.type === "function") {
      return processNode(node.type({ ...node.props, children: node.children }, node.key));
    } else {
      return node;
    }
  } else if (Array.isArray(node)) {
    return node.flatMap(processNode).filter((e2) => e2 != null);
  } else if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    const newNode = new JSXNodeImpl("#text", null, null);
    newNode.text = String(node);
    return newNode;
  } else {
    logWarn("Unvalid node, skipping");
    return void 0;
  }
}
const isJSXNode = (n) => {
  {
    if (n instanceof JSXNodeImpl) {
      return true;
    }
    if (n && typeof n === "object" && n.constructor.name === JSXNodeImpl.name) {
      throw new Error(`Duplicate implementations of "JSXNodeImpl" found`);
    }
    return false;
  }
};
const Fragment = (props) => props.children;
const firstRenderComponent = (rctx, ctx) => {
  ctx.element.setAttribute(QHostAttr, "");
  return renderComponent(rctx, ctx);
};
const renderComponent = (rctx, ctx) => {
  const hostElement = ctx.element;
  const onRenderQRL = ctx.renderQrl;
  assertDefined$1(onRenderQRL);
  ctx.dirty = false;
  rctx.globalState.hostsStaging.delete(hostElement);
  const invocatinContext = newInvokeContext(rctx.doc, hostElement, hostElement, RenderEvent);
  invocatinContext.subscriber = hostElement;
  const waitOn = invocatinContext.waitOn = [];
  ctx.refMap.array.forEach((obj) => {
    removeSub(obj, hostElement);
  });
  const onRenderFn = onRenderQRL.invokeFn(rctx.containerEl, invocatinContext);
  const renderPromise = onRenderFn(wrapSubscriber(getProps(ctx), hostElement));
  return then(renderPromise, (jsxNode) => {
    rctx.hostElements.add(hostElement);
    const waitOnPromise = promiseAll(waitOn);
    return then(waitOnPromise, (waitOnResolved) => {
      var _a;
      waitOnResolved.forEach((task) => {
        if (isStyleTask(task)) {
          appendStyle(rctx, hostElement, task);
        }
      });
      if (ctx.dirty) {
        logDebug("Dropping render. State changed during render.");
        return renderComponent(rctx, ctx);
      }
      let componentCtx = ctx.component;
      if (!componentCtx) {
        componentCtx = ctx.component = {
          hostElement,
          slots: [],
          styleHostClass: void 0,
          styleClass: void 0,
          styleId: void 0
        };
        const scopedStyleId = (_a = hostElement.getAttribute(ComponentScopedStyles)) != null ? _a : void 0;
        if (scopedStyleId) {
          componentCtx.styleId = scopedStyleId;
          componentCtx.styleHostClass = styleHost(scopedStyleId);
          componentCtx.styleClass = styleContent(scopedStyleId);
          hostElement.classList.add(componentCtx.styleHostClass);
        }
      }
      componentCtx.slots = [];
      const newCtx = {
        ...rctx,
        component: componentCtx
      };
      return visitJsxNode(newCtx, hostElement, processNode(jsxNode), false);
    });
  });
};
const SVG_NS = "http://www.w3.org/2000/svg";
function smartUpdateChildren(ctx, elm, ch, mode, isSvg) {
  if (ch.length === 1 && ch[0].type === SkipRerender) {
    if (elm.firstChild !== null) {
      return;
    }
    ch = ch[0].children;
  }
  const oldCh = getChildren(elm, mode);
  if (oldCh.length > 0 && ch.length > 0) {
    return updateChildren(ctx, elm, oldCh, ch, isSvg);
  } else if (ch.length > 0) {
    return addVnodes(ctx, elm, void 0, ch, 0, ch.length - 1, isSvg);
  } else if (oldCh.length > 0) {
    return removeVnodes(ctx, elm, oldCh, 0, oldCh.length - 1);
  }
}
function updateChildren(ctx, parentElm, oldCh, newCh, isSvg) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx;
  let idxInOld;
  let elmToMove;
  const results = [];
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      results.push(patchVnode(ctx, oldStartVnode, newStartVnode, isSvg));
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      results.push(patchVnode(ctx, oldEndVnode, newEndVnode, isSvg));
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      results.push(patchVnode(ctx, oldStartVnode, newEndVnode, isSvg));
      insertBefore(ctx, parentElm, oldStartVnode, oldEndVnode.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      results.push(patchVnode(ctx, oldEndVnode, newStartVnode, isSvg));
      insertBefore(ctx, parentElm, oldEndVnode, oldStartVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      if (oldKeyToIdx === void 0) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      idxInOld = oldKeyToIdx[newStartVnode.key];
      if (idxInOld === void 0) {
        const newElm = createElm(ctx, newStartVnode, isSvg);
        results.push(then(newElm, (newElm2) => {
          insertBefore(ctx, parentElm, newElm2, oldStartVnode);
        }));
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.nodeName !== newStartVnode.type) {
          const newElm = createElm(ctx, newStartVnode, isSvg);
          results.push(then(newElm, (newElm2) => {
            insertBefore(ctx, parentElm, newElm2, oldStartVnode);
          }));
        } else {
          results.push(patchVnode(ctx, elmToMove, newStartVnode, isSvg));
          oldCh[idxInOld] = void 0;
          insertBefore(ctx, parentElm, elmToMove, oldStartVnode);
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }
  if (newStartIdx <= newEndIdx) {
    const before = newCh[newEndIdx + 1] == null ? void 0 : newCh[newEndIdx + 1].elm;
    results.push(addVnodes(ctx, parentElm, before, newCh, newStartIdx, newEndIdx, isSvg));
  }
  let wait = promiseAll(results);
  if (oldStartIdx <= oldEndIdx) {
    wait = then(wait, () => {
      removeVnodes(ctx, parentElm, oldCh, oldStartIdx, oldEndIdx);
    });
  }
  return wait;
}
function isComponentNode(node) {
  return node.props && OnRenderProp in node.props;
}
function getCh(elm) {
  return Array.from(elm.childNodes).filter(isNode);
}
function getChildren(elm, mode) {
  switch (mode) {
    case "default":
      return getCh(elm);
    case "slot":
      return getCh(elm).filter(isChildSlot);
    case "root":
      return getCh(elm).filter(isChildComponent);
    case "fallback":
      return getCh(elm).filter(isFallback);
  }
}
function isNode(elm) {
  return elm.nodeType === 1 || elm.nodeType === 3;
}
function isFallback(node) {
  return node.nodeName === "Q:FALLBACK";
}
function isChildSlot(node) {
  return node.nodeName !== "Q:FALLBACK" && isChildComponent(node);
}
function isSlotTemplate(node) {
  return node.nodeName === "TEMPLATE" && node.hasAttribute(QSlotAttr);
}
function isChildComponent(node) {
  return node.nodeName !== "TEMPLATE" || !node.hasAttribute(QSlotAttr);
}
function splitBy(input, condition) {
  var _a;
  const output = {};
  for (const item of input) {
    const key = condition(item);
    const array = (_a = output[key]) != null ? _a : output[key] = [];
    array.push(item);
  }
  return output;
}
function patchVnode(rctx, elm, vnode, isSvg) {
  rctx.perf.visited++;
  vnode.elm = elm;
  const tag = vnode.type;
  if (tag === "#text") {
    if (elm.data !== vnode.text) {
      setProperty(rctx, elm, "data", vnode.text);
    }
    return;
  }
  if (tag === Host || tag === SkipRerender) {
    return;
  }
  if (!isSvg) {
    isSvg = tag === "svg";
  }
  let promise;
  const props = vnode.props;
  const ctx = getContext(elm);
  const dirty = updateProperties(rctx, ctx, props, isSvg);
  const isSlot = tag === "q:slot";
  if (isSvg && vnode.type === "foreignObject") {
    isSvg = false;
  } else if (isSlot) {
    rctx.component.slots.push(vnode);
  }
  const isComponent = isComponentNode(vnode);
  if (dirty) {
    promise = renderComponent(rctx, ctx);
  }
  const ch = vnode.children;
  if (isComponent) {
    return then(promise, () => {
      const slotMaps = getSlots(ctx.component, elm);
      const splittedChidren = splitBy(ch, getSlotName);
      const promises = [];
      Object.entries(slotMaps.slots).forEach(([key, slotEl]) => {
        if (slotEl && !splittedChidren[key]) {
          const oldCh = getChildren(slotEl, "slot");
          if (oldCh.length > 0) {
            removeVnodes(rctx, slotEl, oldCh, 0, oldCh.length - 1);
          }
        }
      });
      Object.entries(splittedChidren).forEach(([key, ch2]) => {
        const slotElm = getSlotElement(rctx, slotMaps, elm, key);
        promises.push(smartUpdateChildren(rctx, slotElm, ch2, "slot", isSvg));
      });
      return then(promiseAll(promises), () => {
        removeTemplates(rctx, slotMaps);
      });
    });
  }
  const setsInnerHTML = checkInnerHTML(props);
  if (setsInnerHTML) {
    if (ch.length > 0) {
      logWarn("Node can not have children when innerHTML is set");
    }
    return;
  }
  return then(promise, () => {
    const mode = isSlot ? "fallback" : "default";
    return smartUpdateChildren(rctx, elm, ch, mode, isSvg);
  });
}
function addVnodes(ctx, parentElm, before, vnodes, startIdx, endIdx, isSvg) {
  const promises = [];
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    assertDefined$1(ch);
    promises.push(createElm(ctx, ch, isSvg));
  }
  return then(promiseAll(promises), (children) => {
    for (const child of children) {
      insertBefore(ctx, parentElm, child, before);
    }
  });
}
function removeVnodes(ctx, parentElm, nodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = nodes[startIdx];
    assertDefined$1(ch);
    removeNode(ctx, ch);
  }
}
let refCount = 0;
const RefSymbol = Symbol();
function setSlotRef(ctx, hostElm, slotEl) {
  var _a;
  let ref = (_a = hostElm[RefSymbol]) != null ? _a : hostElm.getAttribute("q:sref");
  if (ref === null) {
    ref = intToStr(refCount++);
    hostElm[RefSymbol] = ref;
    setAttribute(ctx, hostElm, "q:sref", ref);
  }
  slotEl.setAttribute("q:sref", ref);
}
function getSlotElement(ctx, slotMaps, parentEl, slotName) {
  const slotEl = slotMaps.slots[slotName];
  if (slotEl) {
    return slotEl;
  }
  const templateEl = slotMaps.templates[slotName];
  if (templateEl) {
    return templateEl.content;
  }
  const template = createTemplate(ctx, slotName);
  prepend(ctx, parentEl, template);
  slotMaps.templates[slotName] = template;
  return template.content;
}
function createTemplate(ctx, slotName) {
  const template = createElement(ctx, "template", false);
  template.setAttribute(QSlotAttr, slotName);
  return template;
}
function removeTemplates(ctx, slotMaps) {
  Object.keys(slotMaps.templates).forEach((key) => {
    const template = slotMaps.templates[key];
    if (template && slotMaps.slots[key] !== void 0) {
      removeNode(ctx, template);
      slotMaps.templates[key] = void 0;
    }
  });
}
function resolveSlotProjection(ctx, hostElm, before, after) {
  Object.entries(before.slots).forEach(([key, slotEl]) => {
    if (slotEl && !after.slots[key]) {
      const template = createTemplate(ctx, key);
      const slotChildren = getChildren(slotEl, "slot");
      template.content.append(...slotChildren);
      hostElm.insertBefore(template, hostElm.firstChild);
      ctx.operations.push({
        el: template,
        operation: "slot-to-template",
        args: slotChildren,
        fn: () => {
        }
      });
    }
  });
  Object.entries(after.slots).forEach(([key, slotEl]) => {
    if (slotEl && !before.slots[key]) {
      const template = before.templates[key];
      if (template) {
        slotEl.appendChild(template.content);
        template.remove();
        ctx.operations.push({
          el: slotEl,
          operation: "template-to-slot",
          args: [template],
          fn: () => {
          }
        });
      }
    }
  });
}
function getSlotName(node) {
  var _a, _b;
  return (_b = (_a = node.props) == null ? void 0 : _a["q:slot"]) != null ? _b : "";
}
function createElm(rctx, vnode, isSvg) {
  rctx.perf.visited++;
  const tag = vnode.type;
  if (tag === "#text") {
    return vnode.elm = createTextNode(rctx, vnode.text);
  }
  if (!isSvg) {
    isSvg = tag === "svg";
  }
  const props = vnode.props;
  const elm = vnode.elm = createElement(rctx, tag, isSvg);
  const isComponent = isComponentNode(vnode);
  const ctx = getContext(elm);
  setKey(elm, vnode.key);
  updateProperties(rctx, ctx, props, isSvg);
  if (isSvg && tag === "foreignObject") {
    isSvg = false;
  }
  const currentComponent = rctx.component;
  if (currentComponent) {
    const styleTag = currentComponent.styleClass;
    if (styleTag) {
      classlistAdd(rctx, elm, styleTag);
    }
    if (tag === "q:slot") {
      setSlotRef(rctx, currentComponent.hostElement, elm);
      rctx.component.slots.push(vnode);
    }
  }
  let wait;
  if (isComponent) {
    const renderQRL = props[OnRenderProp];
    ctx.renderQrl = renderQRL;
    ctx.refMap.add(renderQRL);
    wait = firstRenderComponent(rctx, ctx);
  } else {
    const setsInnerHTML = checkInnerHTML(props);
    if (setsInnerHTML) {
      if (vnode.children.length > 0) {
        logWarn("Node can not have children when innerHTML is set");
      }
      return elm;
    }
  }
  return then(wait, () => {
    let children = vnode.children;
    if (children.length > 0) {
      if (children.length === 1 && children[0].type === SkipRerender) {
        children = children[0].children;
      }
      const slotMap = isComponent ? getSlots(ctx.component, elm) : void 0;
      const promises = children.map((ch) => createElm(rctx, ch, isSvg));
      return then(promiseAll(promises), () => {
        let parent = elm;
        for (const node of children) {
          if (slotMap) {
            parent = getSlotElement(rctx, slotMap, elm, getSlotName(node));
          }
          parent.appendChild(node.elm);
        }
        return elm;
      });
    }
    return elm;
  });
}
const getSlots = (componentCtx, hostElm) => {
  var _a, _b, _c, _d, _e;
  const slots = {};
  const templates = {};
  const slotRef = hostElm.getAttribute("q:sref");
  const existingSlots = Array.from(hostElm.querySelectorAll(`q\\:slot[q\\:sref="${slotRef}"]`));
  const newSlots = (_a = componentCtx == null ? void 0 : componentCtx.slots) != null ? _a : EMPTY_ARRAY$1;
  const t = Array.from(hostElm.childNodes).filter(isSlotTemplate);
  for (const elm of existingSlots) {
    slots[(_b = elm.getAttribute("name")) != null ? _b : ""] = elm;
  }
  for (const vnode of newSlots) {
    slots[(_d = (_c = vnode.props) == null ? void 0 : _c.name) != null ? _d : ""] = vnode.elm;
  }
  for (const elm of t) {
    templates[(_e = elm.getAttribute("q:slot")) != null ? _e : ""] = elm;
  }
  return { slots, templates };
};
const handleStyle = (ctx, elm, _, newValue) => {
  setAttribute(ctx, elm, "style", stringifyClassOrStyle(newValue, false));
  return true;
};
const handleClass = (ctx, elm, _, newValue) => {
  setAttribute(ctx, elm, "class", stringifyClassOrStyle(newValue, true));
  return true;
};
const checkBeforeAssign = (ctx, elm, prop, newValue) => {
  if (prop in elm) {
    if (elm[prop] !== newValue) {
      setProperty(ctx, elm, prop, newValue);
    }
  }
  return true;
};
const dangerouslySetInnerHTML = "dangerouslySetInnerHTML";
const setInnerHTML = (ctx, elm, _, newValue) => {
  if (dangerouslySetInnerHTML in elm) {
    setProperty(ctx, elm, dangerouslySetInnerHTML, newValue);
  } else if ("innerHTML" in elm) {
    setProperty(ctx, elm, "innerHTML", newValue);
  }
  return true;
};
const PROP_HANDLER_MAP = {
  style: handleStyle,
  class: handleClass,
  className: handleClass,
  value: checkBeforeAssign,
  checked: checkBeforeAssign,
  [dangerouslySetInnerHTML]: setInnerHTML
};
const ALLOWS_PROPS = ["class", "className", "style", "id", "q:slot"];
const HOST_PREFIX = "host:";
function updateProperties(rctx, ctx, expectProps, isSvg) {
  if (!expectProps) {
    return false;
  }
  const elm = ctx.element;
  const qwikProps = OnRenderProp in expectProps ? getProps(ctx) : void 0;
  for (let key of Object.keys(expectProps)) {
    if (key === "children" || key === OnRenderProp) {
      continue;
    }
    const newValue = expectProps[key];
    if (key === "ref") {
      newValue.current = elm;
      continue;
    }
    const oldValue = ctx.cache.get(key);
    if (newValue === oldValue) {
      continue;
    }
    ctx.cache.set(key, newValue);
    if (key.startsWith("data-") || key.startsWith("aria-")) {
      setAttribute(rctx, elm, key, newValue);
      continue;
    }
    if (qwikProps) {
      const skipProperty = ALLOWS_PROPS.includes(key);
      const hPrefixed = key.startsWith(HOST_PREFIX);
      if (!skipProperty && !hPrefixed) {
        qwikProps[key] = newValue;
        continue;
      }
      if (hPrefixed) {
        key = key.slice(HOST_PREFIX.length);
      }
    } else if (key.startsWith(HOST_PREFIX)) {
      logWarn(`${HOST_PREFIX} prefix can not be used in non components`);
      continue;
    }
    if (isOnProp(key)) {
      setEvent(rctx, ctx, key.slice(0, -3), newValue);
      continue;
    }
    if (isOn$Prop(key)) {
      setEvent(rctx, ctx, key.slice(0, -1), $(newValue));
      continue;
    }
    const exception = PROP_HANDLER_MAP[key];
    if (exception) {
      if (exception(rctx, elm, key, newValue, oldValue)) {
        continue;
      }
    }
    if (!isSvg && key in elm) {
      setProperty(rctx, elm, key, newValue);
      continue;
    }
    setAttribute(rctx, elm, key, newValue);
  }
  return ctx.dirty;
}
function setAttribute(ctx, el, prop, value) {
  const fn = () => {
    if (value == null) {
      el.removeAttribute(prop);
    } else {
      el.setAttribute(prop, String(value));
    }
  };
  ctx.operations.push({
    el,
    operation: "set-attribute",
    args: [prop, value],
    fn
  });
}
function classlistAdd(ctx, el, hostStyleTag) {
  const fn = () => {
    el.classList.add(hostStyleTag);
  };
  ctx.operations.push({
    el,
    operation: "classlist-add",
    args: [hostStyleTag],
    fn
  });
}
function setProperty(ctx, node, key, value) {
  const fn = () => {
    try {
      node[key] = value;
    } catch (err) {
      logError$1("Set property", { node, key, value }, err);
    }
  };
  ctx.operations.push({
    el: node,
    operation: "set-property",
    args: [key, value],
    fn
  });
}
function createElement(ctx, expectTag, isSvg) {
  const el = isSvg ? ctx.doc.createElementNS(SVG_NS, expectTag) : ctx.doc.createElement(expectTag);
  el[CONTAINER] = ctx.containerEl;
  ctx.operations.push({
    el,
    operation: "create-element",
    args: [expectTag],
    fn: () => {
    }
  });
  return el;
}
function insertBefore(ctx, parent, newChild, refChild) {
  const fn = () => {
    parent.insertBefore(newChild, refChild ? refChild : null);
  };
  ctx.operations.push({
    el: parent,
    operation: "insert-before",
    args: [newChild, refChild],
    fn
  });
  return newChild;
}
function appendStyle(ctx, hostElement, styleTask) {
  const fn = () => {
    var _a;
    const containerEl = ctx.containerEl;
    const stylesParent = ctx.doc.documentElement === containerEl ? (_a = ctx.doc.head) != null ? _a : containerEl : containerEl;
    if (!stylesParent.querySelector(`style[q\\:style="${styleTask.styleId}"]`)) {
      const style = ctx.doc.createElement("style");
      style.setAttribute("q:style", styleTask.styleId);
      style.textContent = styleTask.content;
      stylesParent.insertBefore(style, stylesParent.firstChild);
    }
  };
  ctx.operations.push({
    el: hostElement,
    operation: "append-style",
    args: [styleTask],
    fn
  });
}
function prepend(ctx, parent, newChild) {
  const fn = () => {
    parent.insertBefore(newChild, parent.firstChild);
  };
  ctx.operations.push({
    el: parent,
    operation: "prepend",
    args: [newChild],
    fn
  });
}
function removeNode(ctx, el) {
  const fn = () => {
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el);
    } else {
      logWarn("Trying to remove component already removed", el);
    }
  };
  ctx.operations.push({
    el,
    operation: "remove",
    args: [],
    fn
  });
}
function createTextNode(ctx, text) {
  return ctx.doc.createTextNode(text);
}
function executeContextWithSlots(ctx) {
  const before = ctx.roots.map((elm) => getSlots(void 0, elm));
  executeContext(ctx);
  const after = ctx.roots.map((elm) => getSlots(void 0, elm));
  assertEqual(before.length, after.length);
  for (let i = 0; i < before.length; i++) {
    resolveSlotProjection(ctx, ctx.roots[i], before[i], after[i]);
  }
}
function executeContext(ctx) {
  for (const op of ctx.operations) {
    op.fn();
  }
}
function printRenderStats(ctx) {
  var _a;
  const byOp = {};
  for (const op of ctx.operations) {
    byOp[op.operation] = ((_a = byOp[op.operation]) != null ? _a : 0) + 1;
  }
  const affectedElements = Array.from(new Set(ctx.operations.map((a) => a.el)));
  const stats = {
    byOp,
    roots: ctx.roots,
    hostElements: Array.from(ctx.hostElements),
    affectedElements,
    visitedNodes: ctx.perf.visited,
    operations: ctx.operations.map((v) => [v.operation, v.el, ...v.args])
  };
  logDebug("Render stats", stats);
  return stats;
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
  const map = {};
  for (let i = beginIdx; i <= endIdx; ++i) {
    const child = children[i];
    if (child.nodeType == NodeType.ELEMENT_NODE) {
      const key = getKey(child);
      if (key !== void 0) {
        map[key] = i;
      }
    }
  }
  return map;
}
const KEY_SYMBOL = Symbol("vnode key");
function getKey(el) {
  let key = el[KEY_SYMBOL];
  if (key === void 0) {
    key = el[KEY_SYMBOL] = el.getAttribute("q:key");
  }
  return key;
}
function setKey(el, key) {
  if (typeof key === "string") {
    el.setAttribute("q:key", key);
  }
  el[KEY_SYMBOL] = key;
}
function sameVnode(vnode1, vnode2) {
  const isSameSel = vnode1.nodeName.toLowerCase() === vnode2.type;
  const isSameKey = vnode1.nodeType === NodeType.ELEMENT_NODE ? getKey(vnode1) === vnode2.key : true;
  return isSameSel && isSameKey;
}
function checkInnerHTML(props) {
  return props && ("innerHTML" in props || dangerouslySetInnerHTML in props);
}
function stringifyClassOrStyle(obj, isClass) {
  if (obj == null)
    return "";
  if (typeof obj == "object") {
    let text = "";
    let sep = "";
    if (Array.isArray(obj)) {
      if (!isClass) {
        throw qError(QError.Render_unsupportedFormat_obj_attr, obj, "style");
      }
      for (let i = 0; i < obj.length; i++) {
        text += sep + obj[i];
        sep = " ";
      }
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (value) {
            text += isClass ? value ? sep + key : "" : sep + fromCamelToKebabCase(key) + ":" + value;
            sep = isClass ? " " : ";";
          }
        }
      }
    }
    return text;
  }
  return String(obj);
}
function useHostElement() {
  const element = getInvokeContext().hostElement;
  assertDefined$1(element);
  return element;
}
function useDocument() {
  const doc = getInvokeContext().doc;
  if (!doc) {
    throw new Error("Cant access document for existing context");
  }
  return doc;
}
function useStore(initialState) {
  const [store, setStore] = useSequentialScope();
  const hostElement = useHostElement();
  if (store != null) {
    return wrapSubscriber(store, hostElement);
  }
  const newStore = qObject(initialState, getProxyMap(useDocument()));
  setStore(newStore);
  return wrapSubscriber(newStore, hostElement);
}
function useSequentialScope() {
  const ctx = getInvokeContext();
  assertEqual(ctx.event, RenderEvent);
  const index = ctx.seq;
  const hostElement = useHostElement();
  const elementCtx = getContext(hostElement);
  ctx.seq++;
  const updateFn = (value) => {
    elementCtx.seq[index] = elementCtx.refMap.add(value);
  };
  const seqIndex = elementCtx.seq[index];
  if (typeof seqIndex === "number") {
    return [elementCtx.refMap.get(seqIndex), updateFn];
  }
  return [void 0, updateFn];
}
var WatchMode;
(function(WatchMode2) {
  WatchMode2[WatchMode2["Watch"] = 0] = "Watch";
  WatchMode2[WatchMode2["LayoutEffect"] = 1] = "LayoutEffect";
  WatchMode2[WatchMode2["Effect"] = 2] = "Effect";
})(WatchMode || (WatchMode = {}));
const isWatchDescriptor = (obj) => {
  return obj && typeof obj === "object" && "watchQrl" in obj;
};
function runWatch(watch) {
  if (!watch.dirty) {
    logDebug("Watch is not dirty, skipping run", watch);
    return Promise.resolve(watch);
  }
  watch.dirty = false;
  const promise = new Promise((resolve) => {
    then(watch.running, () => {
      const destroy = watch.destroy;
      if (destroy) {
        watch.destroy = void 0;
        try {
          destroy();
        } catch (err) {
          logError$1(err);
        }
      }
      const hostElement = watch.hostElement;
      const invokationContext = newInvokeContext(getDocument$1(hostElement), hostElement, hostElement, "WatchEvent");
      invokationContext.watch = watch;
      invokationContext.subscriber = watch;
      const watchFn = watch.watchQrl.invokeFn(hostElement, invokationContext);
      const obs = (obj) => wrapSubscriber(obj, watch);
      const captureRef = watch.watchQrl.captureRef;
      if (Array.isArray(captureRef)) {
        captureRef.forEach((obj) => {
          removeSub(obj, watch);
        });
      }
      return then(watchFn(obs), (returnValue) => {
        if (typeof returnValue === "function") {
          watch.destroy = noSerialize(returnValue);
        }
        resolve(watch);
      });
    });
  });
  watch.running = noSerialize(promise);
  return promise;
}
function notifyRender(hostElement) {
  assertDefined$1(hostElement.getAttribute(QHostAttr));
  const containerEl = getContainer(hostElement);
  assertDefined$1(containerEl);
  resumeIfNeeded(containerEl);
  const ctx = getContext(hostElement);
  const state = getRenderingState(containerEl);
  if (ctx.dirty) {
    return state.renderPromise;
  }
  ctx.dirty = true;
  const activeRendering = state.hostsRendering !== void 0;
  if (activeRendering) {
    state.hostsStaging.add(hostElement);
    return state.renderPromise.then((ctx2) => {
      if (state.hostsNext.has(hostElement)) {
        return state.renderPromise;
      } else {
        return ctx2;
      }
    });
  } else {
    state.hostsNext.add(hostElement);
    return scheduleFrame(containerEl, state);
  }
}
function scheduleFrame(containerEl, state) {
  if (state.renderPromise === void 0) {
    state.renderPromise = getPlatform(containerEl).nextTick(() => renderMarked(containerEl, state));
  }
  return state.renderPromise;
}
const SCHEDULE = Symbol("Render state");
function getRenderingState(containerEl) {
  let set = containerEl[SCHEDULE];
  if (!set) {
    containerEl[SCHEDULE] = set = {
      watchNext: /* @__PURE__ */ new Set(),
      watchStagging: /* @__PURE__ */ new Set(),
      watchRunning: /* @__PURE__ */ new Set(),
      hostsNext: /* @__PURE__ */ new Set(),
      hostsStaging: /* @__PURE__ */ new Set(),
      renderPromise: void 0,
      hostsRendering: void 0
    };
  }
  return set;
}
async function renderMarked(containerEl, state) {
  await waitForWatches(state);
  state.hostsRendering = new Set(state.hostsNext);
  state.hostsNext.clear();
  const doc = getDocument$1(containerEl);
  const platform = getPlatform(containerEl);
  const renderingQueue = Array.from(state.hostsRendering);
  sortNodes(renderingQueue);
  const ctx = {
    doc,
    globalState: state,
    hostElements: /* @__PURE__ */ new Set(),
    operations: [],
    roots: [],
    containerEl,
    component: void 0,
    perf: {
      visited: 0,
      timing: []
    }
  };
  for (const el of renderingQueue) {
    if (!ctx.hostElements.has(el)) {
      ctx.roots.push(el);
      await renderComponent(ctx, getContext(el));
    }
  }
  if (ctx.operations.length === 0) {
    {
      if (typeof window !== "undefined" && window.document != null) {
        logDebug("Render skipped. No operations.");
        printRenderStats(ctx);
      }
    }
    postRendering(containerEl, state, ctx);
    return ctx;
  }
  return platform.raf(() => {
    executeContextWithSlots(ctx);
    {
      if (typeof window !== "undefined" && window.document != null) {
        printRenderStats(ctx);
      }
    }
    postRendering(containerEl, state, ctx);
    return ctx;
  });
}
async function postRendering(containerEl, state, ctx) {
  const promises = [];
  state.watchNext.forEach((watch) => {
    promises.push(runWatch(watch));
  });
  state.watchNext.clear();
  state.watchStagging.forEach((watch) => {
    if (ctx.hostElements.has(watch.hostElement)) {
      promises.push(runWatch(watch));
    } else {
      state.watchNext.add(watch);
    }
  });
  await Promise.all(promises);
  state.hostsStaging.forEach((el) => {
    state.hostsNext.add(el);
  });
  state.hostsStaging.clear();
  state.hostsRendering = void 0;
  state.renderPromise = void 0;
  if (state.hostsNext.size + state.watchNext.size > 0) {
    scheduleFrame(containerEl, state);
  }
}
function sortNodes(elements) {
  elements.sort((a, b2) => a.compareDocumentPosition(b2) & 2 ? 1 : -1);
}
const ProxyMapSymbol = Symbol("ProxyMapSymbol");
function getProxyMap(doc) {
  let map = doc[ProxyMapSymbol];
  if (!map) {
    map = doc[ProxyMapSymbol] = /* @__PURE__ */ new WeakMap();
  }
  return map;
}
function qObject(obj, proxyMap) {
  assertEqual(unwrapProxy(obj), obj, "Unexpected proxy at this location");
  if (obj == null || typeof obj !== "object") {
    throw new Error(`Q-ERROR: Only objects can be wrapped in 'QObject', got ` + debugStringify(obj));
  }
  if (obj.constructor !== Object) {
    throw new Error(`Q-ERROR: Only objects literals can be wrapped in 'QObject', got ` + debugStringify(obj));
  }
  return readWriteProxy(obj, proxyMap);
}
function _restoreQObject(obj, map, subs) {
  return readWriteProxy(obj, map, subs);
}
function readWriteProxy(target, proxyMap, subs) {
  if (!target || typeof target !== "object")
    return target;
  let proxy = proxyMap.get(target);
  if (proxy)
    return proxy;
  proxy = new Proxy(target, new ReadWriteProxyHandler(proxyMap, subs));
  proxyMap.set(target, proxy);
  return proxy;
}
const QOjectTargetSymbol = ":target:";
const QOjectSubsSymbol = ":subs:";
const QOjectOriginalProxy = ":proxy:";
const SetSubscriber = Symbol("SetSubscriber");
function unwrapProxy(proxy) {
  if (proxy && typeof proxy == "object") {
    const value = proxy[QOjectTargetSymbol];
    if (value)
      return value;
  }
  return proxy;
}
function wrap(value, proxyMap) {
  if (value && typeof value === "object") {
    if (isQrl(value)) {
      return value;
    }
    if (isElement(value)) {
      return value;
    }
    const nakedValue = unwrapProxy(value);
    if (nakedValue !== value) {
      return value;
    }
    {
      verifySerializable(value);
    }
    const proxy = proxyMap.get(value);
    return proxy ? proxy : readWriteProxy(value, proxyMap);
  } else {
    return value;
  }
}
class ReadWriteProxyHandler {
  constructor(proxyMap, subs = /* @__PURE__ */ new Map()) {
    this.proxyMap = proxyMap;
    this.subs = subs;
  }
  getSub(el) {
    let sub = this.subs.get(el);
    if (!sub) {
      this.subs.set(el, sub = /* @__PURE__ */ new Set());
    }
    return sub;
  }
  get(target, prop) {
    let subscriber = this.subscriber;
    this.subscriber = void 0;
    if (prop === QOjectTargetSymbol)
      return target;
    if (prop === QOjectSubsSymbol)
      return this.subs;
    if (prop === QOjectOriginalProxy)
      return this.proxyMap.get(target);
    const value = target[prop];
    if (typeof prop === "symbol") {
      return value;
    }
    const invokeCtx = tryGetInvokeContext();
    if (!invokeCtx && !qTest) {
      logWarn(`State assigned outside invocation context. Getting prop "${prop}" of:`, target);
    }
    if (invokeCtx) {
      if (invokeCtx.subscriber === null) {
        subscriber = void 0;
      } else if (!subscriber) {
        subscriber = invokeCtx.subscriber;
      }
    } else if (!qTest && !subscriber) {
      logWarn(`State assigned outside invocation context. Getting prop "${prop}" of:`, target);
    }
    if (subscriber) {
      const isArray = Array.isArray(target);
      const sub = this.getSub(subscriber);
      if (!isArray) {
        sub.add(prop);
      }
    }
    return wrap(value, this.proxyMap);
  }
  set(target, prop, newValue) {
    if (typeof prop === "symbol") {
      if (prop === SetSubscriber) {
        this.subscriber = newValue;
      } else {
        target[prop] = newValue;
      }
      return true;
    }
    const subs = this.subs;
    const unwrappedNewValue = unwrapProxy(newValue);
    verifySerializable(unwrappedNewValue);
    const isArray = Array.isArray(target);
    if (isArray) {
      target[prop] = unwrappedNewValue;
      subs.forEach((_, sub) => {
        if (sub.isConnected) {
          notifyChange(sub);
        } else {
          subs.delete(sub);
        }
      });
      return true;
    }
    const oldValue = target[prop];
    if (oldValue !== unwrappedNewValue) {
      target[prop] = unwrappedNewValue;
      subs.forEach((propSets, sub) => {
        if (sub.isConnected) {
          if (propSets.has(prop)) {
            notifyChange(sub);
          }
        } else {
          subs.delete(sub);
        }
      });
    }
    return true;
  }
  has(target, property) {
    if (property === QOjectTargetSymbol)
      return true;
    if (property === QOjectSubsSymbol)
      return true;
    return Object.prototype.hasOwnProperty.call(target, property);
  }
  ownKeys(target) {
    return Object.getOwnPropertyNames(target);
  }
}
function removeSub(obj, subscriber) {
  if (obj && typeof obj === "object") {
    const subs = obj[QOjectSubsSymbol];
    if (subs) {
      subs.delete(subscriber);
    }
  }
}
function notifyChange(subscriber) {
  if (isElement(subscriber)) {
    notifyRender(subscriber);
  } else {
    notifyWatch(subscriber);
  }
}
function notifyWatch(watch) {
  const containerEl = getContainer(watch.hostElement);
  const state = getRenderingState(containerEl);
  watch.dirty = true;
  if (watch.mode === WatchMode.Watch) {
    const promise = runWatch(watch);
    state.watchRunning.add(promise);
    promise.then(() => {
      state.watchRunning.delete(promise);
    });
  } else {
    const activeRendering = state.hostsRendering !== void 0;
    if (activeRendering) {
      state.watchStagging.add(watch);
    } else {
      state.watchNext.add(watch);
      scheduleFrame(containerEl, state);
    }
  }
}
async function waitForWatches(state) {
  while (state.watchRunning.size > 0) {
    await Promise.all(state.watchRunning);
  }
}
function verifySerializable(value) {
  if (shouldSerialize(value) && typeof value == "object" && value !== null) {
    if (Array.isArray(value))
      return;
    if (Object.getPrototypeOf(value) !== Object.prototype) {
      if (isQrl(value))
        return;
      if (isElement(value))
        return;
      throw qError(QError.TODO, "Only primitive and object literals can be serialized.");
    }
  }
}
const NOSERIALIZE = Symbol("NoSerialize");
function shouldSerialize(obj) {
  if (obj !== null && (typeof obj == "object" || typeof obj === "function")) {
    const noSerialize2 = obj[NOSERIALIZE] === true;
    return !noSerialize2;
  }
  return true;
}
function noSerialize(input) {
  input[NOSERIALIZE] = true;
  return input;
}
function wrapSubscriber(obj, subscriber) {
  if (obj && typeof obj === "object") {
    const target = obj[QOjectTargetSymbol];
    if (!target) {
      return obj;
    }
    return new Proxy(obj, {
      get(target2, prop) {
        if (prop === QOjectOriginalProxy) {
          return target2;
        }
        target2[SetSubscriber] = subscriber;
        return target2[prop];
      }
    });
  }
  return obj;
}
function unwrapSubscriber(obj) {
  if (obj && typeof obj === "object") {
    const proxy = obj[QOjectOriginalProxy];
    if (proxy) {
      return proxy;
    }
  }
  return obj;
}
let runtimeSymbolId = 0;
const RUNTIME_QRL = "/runtimeQRL";
const EXTRACT_IMPORT_PATH = /\(\s*(['"])([^\1]+)\1\s*\)/;
const EXTRACT_SELF_IMPORT = /Promise\s*\.\s*resolve/;
const EXTRACT_FILE_NAME = /[\\/(]([\w\d.\-_]+\.(js|ts)x?):/;
function toInternalQRL(qrl2) {
  assertEqual(isQrl(qrl2), true);
  return qrl2;
}
function qrlImport(element, qrl2) {
  const qrl_ = toInternalQRL(qrl2);
  if (qrl_.symbolRef)
    return qrl_.symbolRef;
  if (qrl_.symbolFn) {
    return qrl_.symbolRef = qrl_.symbolFn().then((module) => qrl_.symbolRef = module[qrl_.symbol]);
  } else {
    if (!element) {
      throw new Error(`QRL '${qrl_.chunk}#${qrl_.symbol || "default"}' does not have an attached container`);
    }
    const symbol = getPlatform(getDocument$1(element)).importSymbol(element, qrl_.chunk, qrl_.symbol);
    return qrl_.symbolRef = then(symbol, (ref) => {
      return qrl_.symbolRef = ref;
    });
  }
}
function qrl(chunkOrFn, symbol, lexicalScopeCapture = EMPTY_ARRAY$1) {
  let chunk;
  let symbolFn = null;
  if (typeof chunkOrFn === "string") {
    chunk = chunkOrFn;
  } else if (typeof chunkOrFn === "function") {
    symbolFn = chunkOrFn;
    let match;
    const srcCode = String(chunkOrFn);
    if ((match = srcCode.match(EXTRACT_IMPORT_PATH)) && match[2]) {
      chunk = match[2];
    } else if (match = srcCode.match(EXTRACT_SELF_IMPORT)) {
      const ref = "QWIK-SELF";
      const frames = new Error(ref).stack.split("\n");
      const start = frames.findIndex((f2) => f2.includes(ref));
      const frame = frames[start + 2];
      match = frame.match(EXTRACT_FILE_NAME);
      if (!match) {
        chunk = "main";
      } else {
        chunk = match[1];
      }
    } else {
      throw new Error("Q-ERROR: Dynamic import not found: " + srcCode);
    }
  } else {
    throw new Error("Q-ERROR: Unknown type argument: " + chunkOrFn);
  }
  if (Array.isArray(lexicalScopeCapture)) {
    for (let i = 0; i < lexicalScopeCapture.length; i++) {
      lexicalScopeCapture[i] = unwrapSubscriber(lexicalScopeCapture[i]);
    }
  }
  const qrl2 = new QRLInternal(chunk, symbol, null, symbolFn, null, lexicalScopeCapture);
  const ctx = tryGetInvokeContext();
  if (ctx && ctx.element) {
    qrl2.setContainer(ctx.element);
  }
  return qrl2;
}
function runtimeQrl(symbol, lexicalScopeCapture = EMPTY_ARRAY$1) {
  return new QRLInternal(RUNTIME_QRL, "s" + runtimeSymbolId++, symbol, null, null, lexicalScopeCapture);
}
function stringifyQRL(qrl2, opts = {}) {
  var _a;
  const qrl_ = toInternalQRL(qrl2);
  const symbol = qrl_.symbol;
  const platform = opts.platform;
  const element = opts.element;
  const chunk = platform ? (_a = platform.chunkForSymbol(symbol)) != null ? _a : qrl_.chunk : qrl_.chunk;
  const parts = [chunk];
  if (symbol && symbol !== "default") {
    parts.push("#", symbol);
  }
  const capture = qrl_.capture;
  const captureRef = qrl_.captureRef;
  if (opts.getObjId) {
    if (captureRef && captureRef.length) {
      const capture2 = captureRef.map(opts.getObjId);
      parts.push(`[${capture2.join(" ")}]`);
    }
  } else if (capture && capture.length > 0) {
    parts.push(`[${capture.join(" ")}]`);
  }
  const qrlString = parts.join("");
  if (qrl_.chunk === RUNTIME_QRL && element) {
    const qrls = element.__qrls__ || (element.__qrls__ = /* @__PURE__ */ new Set());
    qrls.add(qrl2);
  }
  return qrlString;
}
function parseQRL(qrl2, el) {
  const endIdx = qrl2.length;
  const hashIdx = indexOf(qrl2, 0, "#");
  const captureIdx = indexOf(qrl2, hashIdx, "[");
  const chunkEndIdx = Math.min(hashIdx, captureIdx);
  const chunk = qrl2.substring(0, chunkEndIdx);
  const symbolStartIdx = hashIdx == endIdx ? hashIdx : hashIdx + 1;
  const symbolEndIdx = captureIdx;
  const symbol = symbolStartIdx == symbolEndIdx ? "default" : qrl2.substring(symbolStartIdx, symbolEndIdx);
  const captureStartIdx = captureIdx;
  const captureEndIdx = endIdx;
  const capture = captureStartIdx === captureEndIdx ? EMPTY_ARRAY$1 : qrl2.substring(captureStartIdx + 1, captureEndIdx - 1).split(" ");
  if (chunk === RUNTIME_QRL) {
    logError$1(`Q-ERROR: '${qrl2}' is runtime but no instance found on element.`);
  }
  const iQrl = new QRLInternal(chunk, symbol, null, null, capture, null);
  if (el) {
    iQrl.setContainer(el);
  }
  return iQrl;
}
function indexOf(text, startIdx, char) {
  const endIdx = text.length;
  const charIdx = text.indexOf(char, startIdx == endIdx ? 0 : startIdx);
  return charIdx == -1 ? endIdx : charIdx;
}
function componentQrl(onRenderQrl, options = {}) {
  var _a;
  const tagName = (_a = options.tagName) != null ? _a : "div";
  return function QSimpleComponent(props, key) {
    return jsx(tagName, { [OnRenderProp]: onRenderQrl, ...props }, key);
  };
}
function pauseContainer(elmOrDoc) {
  const doc = getDocument$1(elmOrDoc);
  const containerEl = isDocument$1(elmOrDoc) ? elmOrDoc.documentElement : elmOrDoc;
  const parentJSON = isDocument$1(elmOrDoc) ? elmOrDoc.body : containerEl;
  const data = snapshotState(containerEl);
  const script = doc.createElement("script");
  script.setAttribute("type", "qwik/json");
  script.textContent = JSON.stringify(data, void 0, "  ");
  parentJSON.appendChild(script);
  containerEl.setAttribute(QContainerAttr, "paused");
}
const Slot = (props) => {
  const hasChildren = props.children || Array.isArray(props.children) && props.children.length > 0;
  const newChildrem = !hasChildren ? [] : jsx("q:fallback", {
    children: props.children
  });
  return jsx("q:slot", {
    name: props.name,
    children: newChildrem
  }, props.name);
};
const version = "next";
async function render$1(parent, jsxNode) {
  if (!isJSXNode(jsxNode)) {
    jsxNode = jsx(jsxNode, null);
  }
  const doc = getDocument$1(parent);
  const containerEl = getElement$1(parent);
  if (containerEl.hasAttribute("q:container")) {
    logError$1("You can render over a existing q:container. Skipping render().");
    return;
  }
  injectQContainer(containerEl);
  const ctx = {
    doc,
    globalState: getRenderingState(containerEl),
    hostElements: /* @__PURE__ */ new Set(),
    operations: [],
    roots: [parent],
    component: void 0,
    containerEl,
    perf: {
      visited: 0,
      timing: []
    }
  };
  await visitJsxNode(ctx, parent, processNode(jsxNode), false);
  executeContext(ctx);
  if (!qTest) {
    injectQwikSlotCSS(parent);
  }
  {
    if (typeof window !== "undefined" && window.document != null) {
      printRenderStats(ctx);
    }
  }
  const promises = [];
  ctx.hostElements.forEach((host) => {
    const elCtx = getContext(host);
    elCtx.refMap.array.filter(isWatchDescriptor).forEach((watch) => {
      if (watch.dirty) {
        promises.push(runWatch(watch));
      }
    });
  });
  await Promise.all(promises);
  return ctx;
}
function injectQwikSlotCSS(docOrElm) {
  const doc = getDocument$1(docOrElm);
  const element = isDocument$1(docOrElm) ? docOrElm.head : docOrElm;
  const style = doc.createElement("style");
  style.setAttribute("id", "qwik/base-styles");
  style.textContent = `q\\:slot{display:contents}q\\:fallback{display:none}q\\:fallback:last-child{display:contents}`;
  element.insertBefore(style, element.firstChild);
}
function getElement$1(docOrElm) {
  return isDocument$1(docOrElm) ? docOrElm.documentElement : docOrElm;
}
function injectQContainer(containerEl) {
  containerEl.setAttribute("q:version", version);
  containerEl.setAttribute(QContainerAttr, "resumed");
}
function useURL() {
  const url = getInvokeContext().url;
  if (!url) {
    throw new Error("Q-ERROR: no URL is associated with the execution context");
  }
  return url;
}
function useLexicalScope() {
  var _a;
  const context = getInvokeContext();
  const hostElement = context.hostElement;
  const qrl2 = (_a = context.qrl) != null ? _a : parseQRL(decodeURIComponent(String(useURL())), hostElement);
  if (qrl2.captureRef == null) {
    const el = context.element;
    assertDefined$1(el);
    resumeIfNeeded(getContainer(el));
    const ctx = getContext(el);
    qrl2.captureRef = qrl2.capture.map((idx) => qInflate(idx, ctx));
  }
  const subscriber = context.subscriber;
  if (subscriber) {
    return qrl2.captureRef.map((obj) => wrapSubscriber(obj, subscriber));
  }
  return qrl2.captureRef;
}
/**
 * @license
 * @builder.io/qwik/server
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
if (typeof global == "undefined") {
  const g2 = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof self ? self : {};
  g2.global = g2;
}
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b2) => (typeof require !== "undefined" ? require : a)[b2]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
function createTimer() {
  if (typeof performance === "undefined") {
    return () => 0;
  }
  const start = performance.now();
  return () => {
    const end = performance.now();
    const delta = end - start;
    return delta / 1e6;
  };
}
function ensureGlobals(doc, opts) {
  if (!doc[QWIK_DOC]) {
    if (!doc || doc.nodeType !== 9) {
      throw new Error(`Invalid document`);
    }
    doc[QWIK_DOC] = true;
    const loc = normalizeUrl(opts.url);
    Object.defineProperty(doc, "baseURI", {
      get: () => loc.href,
      set: (url) => loc.href = normalizeUrl(url).href
    });
    doc.defaultView = {
      get document() {
        return doc;
      },
      get location() {
        return loc;
      },
      get origin() {
        return loc.origin;
      },
      addEventListener: noop,
      removeEventListener: noop,
      history: {
        pushState: noop,
        replaceState: noop,
        go: noop,
        back: noop,
        forward: noop
      },
      CustomEvent: class CustomEvent {
        constructor(type, details) {
          Object.assign(this, details);
          this.type = type;
        }
      }
    };
  }
  return doc.defaultView;
}
var QWIK_DOC = Symbol();
function normalizeUrl(url) {
  if (url != null) {
    if (typeof url === "string") {
      return new URL(url || "/", BASE_URI);
    }
    if (typeof url.href === "string") {
      return new URL(url.href || "/", BASE_URI);
    }
  }
  return new URL(BASE_URI);
}
var BASE_URI = `http://document.qwik.dev/`;
var noop = () => {
};
var O = (e2, t) => () => (t || e2((t = { exports: {} }).exports, t), t.exports);
var Vt = O((xf, Ai) => {
  Ai.exports = Dt;
  Dt.CAPTURING_PHASE = 1;
  Dt.AT_TARGET = 2;
  Dt.BUBBLING_PHASE = 3;
  function Dt(e2, t) {
    if (this.type = "", this.target = null, this.currentTarget = null, this.eventPhase = Dt.AT_TARGET, this.bubbles = false, this.cancelable = false, this.isTrusted = false, this.defaultPrevented = false, this.timeStamp = Date.now(), this._propagationStopped = false, this._immediatePropagationStopped = false, this._initialized = true, this._dispatching = false, e2 && (this.type = e2), t)
      for (var r in t)
        this[r] = t[r];
  }
  Dt.prototype = Object.create(Object.prototype, { constructor: { value: Dt }, stopPropagation: { value: function() {
    this._propagationStopped = true;
  } }, stopImmediatePropagation: { value: function() {
    this._propagationStopped = true, this._immediatePropagationStopped = true;
  } }, preventDefault: { value: function() {
    this.cancelable && (this.defaultPrevented = true);
  } }, initEvent: { value: function(t, r, n) {
    this._initialized = true, !this._dispatching && (this._propagationStopped = false, this._immediatePropagationStopped = false, this.defaultPrevented = false, this.isTrusted = false, this.target = null, this.type = t, this.bubbles = r, this.cancelable = n);
  } } });
});
var Kn = O((pf, Di) => {
  var Li = Vt();
  Di.exports = $n;
  function $n() {
    Li.call(this), this.view = null, this.detail = 0;
  }
  $n.prototype = Object.create(Li.prototype, { constructor: { value: $n }, initUIEvent: { value: function(e2, t, r, n, l) {
    this.initEvent(e2, t, r), this.view = n, this.detail = l;
  } } });
});
var Qn = O((mf, Ri) => {
  var Mi = Kn();
  Ri.exports = Xn;
  function Xn() {
    Mi.call(this), this.screenX = this.screenY = this.clientX = this.clientY = 0, this.ctrlKey = this.altKey = this.shiftKey = this.metaKey = false, this.button = 0, this.buttons = 1, this.relatedTarget = null;
  }
  Xn.prototype = Object.create(Mi.prototype, { constructor: { value: Xn }, initMouseEvent: { value: function(e2, t, r, n, l, f2, _, y, w, S, D, ae, ce, g2, re) {
    switch (this.initEvent(e2, t, r, n, l), this.screenX = f2, this.screenY = _, this.clientX = y, this.clientY = w, this.ctrlKey = S, this.altKey = D, this.shiftKey = ae, this.metaKey = ce, this.button = g2, g2) {
      case 0:
        this.buttons = 1;
        break;
      case 1:
        this.buttons = 4;
        break;
      case 2:
        this.buttons = 2;
        break;
      default:
        this.buttons = 0;
        break;
    }
    this.relatedTarget = re;
  } }, getModifierState: { value: function(e2) {
    switch (e2) {
      case "Alt":
        return this.altKey;
      case "Control":
        return this.ctrlKey;
      case "Shift":
        return this.shiftKey;
      case "Meta":
        return this.metaKey;
      default:
        return false;
    }
  } } });
});
var Xr = O((gf, Oi) => {
  Oi.exports = Kr;
  var Cl = 1, Al = 3, Ll = 4, Dl = 5, Ml = 7, Rl = 8, Il = 9, Ol = 11, ql = 12, Hl = 13, Fl = 14, Pl = 15, Bl = 17, Ul = 18, Vl = 19, zl = 20, jl = 21, Gl = 22, Wl = 23, Yl = 24, $l = 25, Kl = [null, "INDEX_SIZE_ERR", null, "HIERARCHY_REQUEST_ERR", "WRONG_DOCUMENT_ERR", "INVALID_CHARACTER_ERR", null, "NO_MODIFICATION_ALLOWED_ERR", "NOT_FOUND_ERR", "NOT_SUPPORTED_ERR", "INUSE_ATTRIBUTE_ERR", "INVALID_STATE_ERR", "SYNTAX_ERR", "INVALID_MODIFICATION_ERR", "NAMESPACE_ERR", "INVALID_ACCESS_ERR", null, "TYPE_MISMATCH_ERR", "SECURITY_ERR", "NETWORK_ERR", "ABORT_ERR", "URL_MISMATCH_ERR", "QUOTA_EXCEEDED_ERR", "TIMEOUT_ERR", "INVALID_NODE_TYPE_ERR", "DATA_CLONE_ERR"], Xl = [null, "INDEX_SIZE_ERR (1): the index is not in the allowed range", null, "HIERARCHY_REQUEST_ERR (3): the operation would yield an incorrect nodes model", "WRONG_DOCUMENT_ERR (4): the object is in the wrong Document, a call to importNode is required", "INVALID_CHARACTER_ERR (5): the string contains invalid characters", null, "NO_MODIFICATION_ALLOWED_ERR (7): the object can not be modified", "NOT_FOUND_ERR (8): the object can not be found here", "NOT_SUPPORTED_ERR (9): this operation is not supported", "INUSE_ATTRIBUTE_ERR (10): setAttributeNode called on owned Attribute", "INVALID_STATE_ERR (11): the object is in an invalid state", "SYNTAX_ERR (12): the string did not match the expected pattern", "INVALID_MODIFICATION_ERR (13): the object can not be modified in this way", "NAMESPACE_ERR (14): the operation is not allowed by Namespaces in XML", "INVALID_ACCESS_ERR (15): the object does not support the operation or argument", null, "TYPE_MISMATCH_ERR (17): the type of the object does not match the expected type", "SECURITY_ERR (18): the operation is insecure", "NETWORK_ERR (19): a network error occurred", "ABORT_ERR (20): the user aborted an operation", "URL_MISMATCH_ERR (21): the given URL does not match another URL", "QUOTA_EXCEEDED_ERR (22): the quota has been exceeded", "TIMEOUT_ERR (23): a timeout occurred", "INVALID_NODE_TYPE_ERR (24): the supplied node is invalid or has an invalid ancestor for this operation", "DATA_CLONE_ERR (25): the object can not be cloned."], Ii = { INDEX_SIZE_ERR: Cl, DOMSTRING_SIZE_ERR: 2, HIERARCHY_REQUEST_ERR: Al, WRONG_DOCUMENT_ERR: Ll, INVALID_CHARACTER_ERR: Dl, NO_DATA_ALLOWED_ERR: 6, NO_MODIFICATION_ALLOWED_ERR: Ml, NOT_FOUND_ERR: Rl, NOT_SUPPORTED_ERR: Il, INUSE_ATTRIBUTE_ERR: 10, INVALID_STATE_ERR: Ol, SYNTAX_ERR: ql, INVALID_MODIFICATION_ERR: Hl, NAMESPACE_ERR: Fl, INVALID_ACCESS_ERR: Pl, VALIDATION_ERR: 16, TYPE_MISMATCH_ERR: Bl, SECURITY_ERR: Ul, NETWORK_ERR: Vl, ABORT_ERR: zl, URL_MISMATCH_ERR: jl, QUOTA_EXCEEDED_ERR: Gl, TIMEOUT_ERR: Wl, INVALID_NODE_TYPE_ERR: Yl, DATA_CLONE_ERR: $l };
  function Kr(e2) {
    Error.call(this), Error.captureStackTrace(this, this.constructor), this.code = e2, this.message = Xl[e2], this.name = Kl[e2];
  }
  Kr.prototype.__proto__ = Error.prototype;
  for ($r in Ii)
    Zn = { value: Ii[$r] }, Object.defineProperty(Kr, $r, Zn), Object.defineProperty(Kr.prototype, $r, Zn);
  var Zn, $r;
});
var Qr = O((qi) => {
  qi.isApiWritable = !global.__domino_frozen__;
});
var he = O((Z) => {
  var de = Xr(), me = de, Ql = Qr().isApiWritable;
  Z.NAMESPACE = { HTML: "http://www.w3.org/1999/xhtml", XML: "http://www.w3.org/XML/1998/namespace", XMLNS: "http://www.w3.org/2000/xmlns/", MATHML: "http://www.w3.org/1998/Math/MathML", SVG: "http://www.w3.org/2000/svg", XLINK: "http://www.w3.org/1999/xlink" };
  Z.IndexSizeError = function() {
    throw new de(me.INDEX_SIZE_ERR);
  };
  Z.HierarchyRequestError = function() {
    throw new de(me.HIERARCHY_REQUEST_ERR);
  };
  Z.WrongDocumentError = function() {
    throw new de(me.WRONG_DOCUMENT_ERR);
  };
  Z.InvalidCharacterError = function() {
    throw new de(me.INVALID_CHARACTER_ERR);
  };
  Z.NoModificationAllowedError = function() {
    throw new de(me.NO_MODIFICATION_ALLOWED_ERR);
  };
  Z.NotFoundError = function() {
    throw new de(me.NOT_FOUND_ERR);
  };
  Z.NotSupportedError = function() {
    throw new de(me.NOT_SUPPORTED_ERR);
  };
  Z.InvalidStateError = function() {
    throw new de(me.INVALID_STATE_ERR);
  };
  Z.SyntaxError = function() {
    throw new de(me.SYNTAX_ERR);
  };
  Z.InvalidModificationError = function() {
    throw new de(me.INVALID_MODIFICATION_ERR);
  };
  Z.NamespaceError = function() {
    throw new de(me.NAMESPACE_ERR);
  };
  Z.InvalidAccessError = function() {
    throw new de(me.INVALID_ACCESS_ERR);
  };
  Z.TypeMismatchError = function() {
    throw new de(me.TYPE_MISMATCH_ERR);
  };
  Z.SecurityError = function() {
    throw new de(me.SECURITY_ERR);
  };
  Z.NetworkError = function() {
    throw new de(me.NETWORK_ERR);
  };
  Z.AbortError = function() {
    throw new de(me.ABORT_ERR);
  };
  Z.UrlMismatchError = function() {
    throw new de(me.URL_MISMATCH_ERR);
  };
  Z.QuotaExceededError = function() {
    throw new de(me.QUOTA_EXCEEDED_ERR);
  };
  Z.TimeoutError = function() {
    throw new de(me.TIMEOUT_ERR);
  };
  Z.InvalidNodeTypeError = function() {
    throw new de(me.INVALID_NODE_TYPE_ERR);
  };
  Z.DataCloneError = function() {
    throw new de(me.DATA_CLONE_ERR);
  };
  Z.nyi = function() {
    throw new Error("NotYetImplemented");
  };
  Z.shouldOverride = function() {
    throw new Error("Abstract function; should be overriding in subclass.");
  };
  Z.assert = function(e2, t) {
    if (!e2)
      throw new Error("Assertion failed: " + (t || "") + `
` + new Error().stack);
  };
  Z.expose = function(e2, t) {
    for (var r in e2)
      Object.defineProperty(t.prototype, r, { value: e2[r], writable: Ql });
  };
  Z.merge = function(e2, t) {
    for (var r in t)
      e2[r] = t[r];
  };
  Z.documentOrder = function(e2, t) {
    return 3 - (e2.compareDocumentPosition(t) & 6);
  };
  Z.toASCIILowerCase = function(e2) {
    return e2.replace(/[A-Z]+/g, function(t) {
      return t.toLowerCase();
    });
  };
  Z.toASCIIUpperCase = function(e2) {
    return e2.replace(/[a-z]+/g, function(t) {
      return t.toUpperCase();
    });
  };
});
var Jn = O((Ef, Fi) => {
  var Mt = Vt(), Zl = Qn(), Jl = he();
  Fi.exports = Hi;
  function Hi() {
  }
  Hi.prototype = { addEventListener: function(t, r, n) {
    if (!!r) {
      n === void 0 && (n = false), this._listeners || (this._listeners = /* @__PURE__ */ Object.create(null)), this._listeners[t] || (this._listeners[t] = []);
      for (var l = this._listeners[t], f2 = 0, _ = l.length; f2 < _; f2++) {
        var y = l[f2];
        if (y.listener === r && y.capture === n)
          return;
      }
      var w = { listener: r, capture: n };
      typeof r == "function" && (w.f = r), l.push(w);
    }
  }, removeEventListener: function(t, r, n) {
    if (n === void 0 && (n = false), this._listeners) {
      var l = this._listeners[t];
      if (l)
        for (var f2 = 0, _ = l.length; f2 < _; f2++) {
          var y = l[f2];
          if (y.listener === r && y.capture === n) {
            l.length === 1 ? this._listeners[t] = void 0 : l.splice(f2, 1);
            return;
          }
        }
    }
  }, dispatchEvent: function(t) {
    return this._dispatchEvent(t, false);
  }, _dispatchEvent: function(t, r) {
    typeof r != "boolean" && (r = false);
    function n(S, D) {
      var ae = D.type, ce = D.eventPhase;
      if (D.currentTarget = S, ce !== Mt.CAPTURING_PHASE && S._handlers && S._handlers[ae]) {
        var g2 = S._handlers[ae], re;
        if (typeof g2 == "function")
          re = g2.call(D.currentTarget, D);
        else {
          var $2 = g2.handleEvent;
          if (typeof $2 != "function")
            throw new TypeError("handleEvent property of event handler object isnot a function.");
          re = $2.call(g2, D);
        }
        switch (D.type) {
          case "mouseover":
            re === true && D.preventDefault();
            break;
          case "beforeunload":
          default:
            re === false && D.preventDefault();
            break;
        }
      }
      var V = S._listeners && S._listeners[ae];
      if (!!V) {
        V = V.slice();
        for (var ve = 0, U = V.length; ve < U; ve++) {
          if (D._immediatePropagationStopped)
            return;
          var ie = V[ve];
          if (!(ce === Mt.CAPTURING_PHASE && !ie.capture || ce === Mt.BUBBLING_PHASE && ie.capture))
            if (ie.f)
              ie.f.call(D.currentTarget, D);
            else {
              var be = ie.listener.handleEvent;
              if (typeof be != "function")
                throw new TypeError("handleEvent property of event listener object is not a function.");
              be.call(ie.listener, D);
            }
        }
      }
    }
    (!t._initialized || t._dispatching) && Jl.InvalidStateError(), t.isTrusted = r, t._dispatching = true, t.target = this;
    for (var l = [], f2 = this.parentNode; f2; f2 = f2.parentNode)
      l.push(f2);
    t.eventPhase = Mt.CAPTURING_PHASE;
    for (var _ = l.length - 1; _ >= 0 && (n(l[_], t), !t._propagationStopped); _--)
      ;
    if (t._propagationStopped || (t.eventPhase = Mt.AT_TARGET, n(this, t)), t.bubbles && !t._propagationStopped) {
      t.eventPhase = Mt.BUBBLING_PHASE;
      for (var y = 0, w = l.length; y < w && (n(l[y], t), !t._propagationStopped); y++)
        ;
    }
    if (t._dispatching = false, t.eventPhase = Mt.AT_TARGET, t.currentTarget = null, r && !t.defaultPrevented && t instanceof Zl)
      switch (t.type) {
        case "mousedown":
          this._armed = { x: t.clientX, y: t.clientY, t: t.timeStamp };
          break;
        case "mouseout":
        case "mouseover":
          this._armed = null;
          break;
        case "mouseup":
          this._isClick(t) && this._doClick(t), this._armed = null;
          break;
      }
    return !t.defaultPrevented;
  }, _isClick: function(e2) {
    return this._armed !== null && e2.type === "mouseup" && e2.isTrusted && e2.button === 0 && e2.timeStamp - this._armed.t < 1e3 && Math.abs(e2.clientX - this._armed.x) < 10 && Math.abs(e2.clientY - this._armed.Y) < 10;
  }, _doClick: function(e2) {
    if (!this._click_in_progress) {
      this._click_in_progress = true;
      for (var t = this; t && !t._post_click_activation_steps; )
        t = t.parentNode;
      t && t._pre_click_activation_steps && t._pre_click_activation_steps();
      var r = this.ownerDocument.createEvent("MouseEvent");
      r.initMouseEvent("click", true, true, this.ownerDocument.defaultView, 1, e2.screenX, e2.screenY, e2.clientX, e2.clientY, e2.ctrlKey, e2.altKey, e2.shiftKey, e2.metaKey, e2.button, null);
      var n = this._dispatchEvent(r, true);
      t && (n ? t._post_click_activation_steps && t._post_click_activation_steps(r) : t._cancelled_activation_steps && t._cancelled_activation_steps());
    }
  }, _setEventHandler: function(t, r) {
    this._handlers || (this._handlers = /* @__PURE__ */ Object.create(null)), this._handlers[t] = r;
  }, _getEventHandler: function(t) {
    return this._handlers && this._handlers[t] || null;
  } };
});
var ea = O((vf, Pi) => {
  var ot = he(), ze = Pi.exports = { valid: function(e2) {
    return ot.assert(e2, "list falsy"), ot.assert(e2._previousSibling, "previous falsy"), ot.assert(e2._nextSibling, "next falsy"), true;
  }, insertBefore: function(e2, t) {
    ot.assert(ze.valid(e2) && ze.valid(t));
    var r = e2, n = e2._previousSibling, l = t, f2 = t._previousSibling;
    r._previousSibling = f2, n._nextSibling = l, f2._nextSibling = r, l._previousSibling = n, ot.assert(ze.valid(e2) && ze.valid(t));
  }, replace: function(e2, t) {
    ot.assert(ze.valid(e2) && (t === null || ze.valid(t))), t !== null && ze.insertBefore(t, e2), ze.remove(e2), ot.assert(ze.valid(e2) && (t === null || ze.valid(t)));
  }, remove: function(e2) {
    ot.assert(ze.valid(e2));
    var t = e2._previousSibling;
    if (t !== e2) {
      var r = e2._nextSibling;
      t._nextSibling = r, r._previousSibling = t, e2._previousSibling = e2._nextSibling = e2, ot.assert(ze.valid(e2));
    }
  } };
});
var ta = O((yf, Ui) => {
  Ui.exports = { serializeOne: su };
  var Bi = he(), Rt = Bi.NAMESPACE, eu = { STYLE: true, SCRIPT: true, XMP: true, IFRAME: true, NOEMBED: true, NOFRAMES: true, PLAINTEXT: true }, tu = { area: true, base: true, basefont: true, bgsound: true, br: true, col: true, embed: true, frame: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true }, ru = {};
  function nu(e2) {
    return e2.replace(/[&<>\u00A0]/g, function(t) {
      switch (t) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "\xA0":
          return "&nbsp;";
      }
    });
  }
  function au(e2) {
    var t = /[&"\u00A0]/g;
    return t.test(e2) ? e2.replace(t, function(r) {
      switch (r) {
        case "&":
          return "&amp;";
        case '"':
          return "&quot;";
        case "\xA0":
          return "&nbsp;";
      }
    }) : e2;
  }
  function iu(e2) {
    var t = e2.namespaceURI;
    return t ? t === Rt.XML ? "xml:" + e2.localName : t === Rt.XLINK ? "xlink:" + e2.localName : t === Rt.XMLNS ? e2.localName === "xmlns" ? "xmlns" : "xmlns:" + e2.localName : e2.name : e2.localName;
  }
  function su(e2, t) {
    var r = "";
    switch (e2.nodeType) {
      case 1:
        var n = e2.namespaceURI, l = n === Rt.HTML, f2 = l || n === Rt.SVG || n === Rt.MATHML ? e2.localName : e2.tagName;
        r += "<" + f2;
        for (var _ = 0, y = e2._numattrs; _ < y; _++) {
          var w = e2._attr(_);
          r += " " + iu(w), w.value !== void 0 && (r += '="' + au(w.value) + '"');
        }
        if (r += ">", !(l && tu[f2])) {
          var S = e2.serialize();
          l && ru[f2] && S.charAt(0) === `
` && (r += `
`), r += S, r += "</" + f2 + ">";
        }
        break;
      case 3:
      case 4:
        var D;
        t.nodeType === 1 && t.namespaceURI === Rt.HTML ? D = t.tagName : D = "", eu[D] || D === "NOSCRIPT" && t.ownerDocument._scripting_enabled ? r += e2.data : r += nu(e2.data);
        break;
      case 8:
        r += "<!--" + e2.data + "-->";
        break;
      case 7:
        r += "<?" + e2.target + " " + e2.data + "?>";
        break;
      case 10:
        r += "<!DOCTYPE " + e2.name, r += ">";
        break;
      default:
        Bi.InvalidStateError();
    }
    return r;
  }
});
var Te = O((Tf, Yi) => {
  Yi.exports = xe;
  var Wi = Jn(), Zr = ea(), Vi = ta(), J = he();
  function xe() {
    Wi.call(this), this.parentNode = null, this._nextSibling = this._previousSibling = this, this._index = void 0;
  }
  var Me = xe.ELEMENT_NODE = 1, ra = xe.ATTRIBUTE_NODE = 2, Jr = xe.TEXT_NODE = 3, ou = xe.CDATA_SECTION_NODE = 4, cu = xe.ENTITY_REFERENCE_NODE = 5, na = xe.ENTITY_NODE = 6, zi = xe.PROCESSING_INSTRUCTION_NODE = 7, ji = xe.COMMENT_NODE = 8, dr = xe.DOCUMENT_NODE = 9, je = xe.DOCUMENT_TYPE_NODE = 10, vt = xe.DOCUMENT_FRAGMENT_NODE = 11, aa = xe.NOTATION_NODE = 12, ia = xe.DOCUMENT_POSITION_DISCONNECTED = 1, sa = xe.DOCUMENT_POSITION_PRECEDING = 2, oa = xe.DOCUMENT_POSITION_FOLLOWING = 4, Gi = xe.DOCUMENT_POSITION_CONTAINS = 8, ca = xe.DOCUMENT_POSITION_CONTAINED_BY = 16, la = xe.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;
  xe.prototype = Object.create(Wi.prototype, { baseURI: { get: J.nyi }, parentElement: { get: function() {
    return this.parentNode && this.parentNode.nodeType === Me ? this.parentNode : null;
  } }, hasChildNodes: { value: J.shouldOverride }, firstChild: { get: J.shouldOverride }, lastChild: { get: J.shouldOverride }, previousSibling: { get: function() {
    var e2 = this.parentNode;
    return !e2 || this === e2.firstChild ? null : this._previousSibling;
  } }, nextSibling: { get: function() {
    var e2 = this.parentNode, t = this._nextSibling;
    return !e2 || t === e2.firstChild ? null : t;
  } }, textContent: { get: function() {
    return null;
  }, set: function(e2) {
  } }, _countChildrenOfType: { value: function(e2) {
    for (var t = 0, r = this.firstChild; r !== null; r = r.nextSibling)
      r.nodeType === e2 && t++;
    return t;
  } }, _ensureInsertValid: { value: function(t, r, n) {
    var l = this, f2, _;
    if (!t.nodeType)
      throw new TypeError("not a node");
    switch (l.nodeType) {
      case dr:
      case vt:
      case Me:
        break;
      default:
        J.HierarchyRequestError();
    }
    switch (t.isAncestor(l) && J.HierarchyRequestError(), (r !== null || !n) && r.parentNode !== l && J.NotFoundError(), t.nodeType) {
      case vt:
      case je:
      case Me:
      case Jr:
      case zi:
      case ji:
        break;
      default:
        J.HierarchyRequestError();
    }
    if (l.nodeType === dr)
      switch (t.nodeType) {
        case Jr:
          J.HierarchyRequestError();
          break;
        case vt:
          switch (t._countChildrenOfType(Jr) > 0 && J.HierarchyRequestError(), t._countChildrenOfType(Me)) {
            case 0:
              break;
            case 1:
              if (r !== null)
                for (n && r.nodeType === je && J.HierarchyRequestError(), _ = r.nextSibling; _ !== null; _ = _.nextSibling)
                  _.nodeType === je && J.HierarchyRequestError();
              f2 = l._countChildrenOfType(Me), n ? f2 > 0 && J.HierarchyRequestError() : (f2 > 1 || f2 === 1 && r.nodeType !== Me) && J.HierarchyRequestError();
              break;
            default:
              J.HierarchyRequestError();
          }
          break;
        case Me:
          if (r !== null)
            for (n && r.nodeType === je && J.HierarchyRequestError(), _ = r.nextSibling; _ !== null; _ = _.nextSibling)
              _.nodeType === je && J.HierarchyRequestError();
          f2 = l._countChildrenOfType(Me), n ? f2 > 0 && J.HierarchyRequestError() : (f2 > 1 || f2 === 1 && r.nodeType !== Me) && J.HierarchyRequestError();
          break;
        case je:
          if (r === null)
            l._countChildrenOfType(Me) && J.HierarchyRequestError();
          else
            for (_ = l.firstChild; _ !== null && _ !== r; _ = _.nextSibling)
              _.nodeType === Me && J.HierarchyRequestError();
          f2 = l._countChildrenOfType(je), n ? f2 > 0 && J.HierarchyRequestError() : (f2 > 1 || f2 === 1 && r.nodeType !== je) && J.HierarchyRequestError();
          break;
      }
    else
      t.nodeType === je && J.HierarchyRequestError();
  } }, insertBefore: { value: function(t, r) {
    var n = this;
    n._ensureInsertValid(t, r, true);
    var l = r;
    return l === t && (l = t.nextSibling), n.doc.adoptNode(t), t._insertOrReplace(n, l, false), t;
  } }, appendChild: { value: function(e2) {
    return this.insertBefore(e2, null);
  } }, _appendChild: { value: function(e2) {
    e2._insertOrReplace(this, null, false);
  } }, removeChild: { value: function(t) {
    var r = this;
    if (!t.nodeType)
      throw new TypeError("not a node");
    return t.parentNode !== r && J.NotFoundError(), t.remove(), t;
  } }, replaceChild: { value: function(t, r) {
    var n = this;
    return n._ensureInsertValid(t, r, false), t.doc !== n.doc && n.doc.adoptNode(t), t._insertOrReplace(n, r, true), r;
  } }, contains: { value: function(t) {
    return t === null ? false : this === t ? true : (this.compareDocumentPosition(t) & ca) !== 0;
  } }, compareDocumentPosition: { value: function(t) {
    if (this === t)
      return 0;
    if (this.doc !== t.doc || this.rooted !== t.rooted)
      return ia + la;
    for (var r = [], n = [], l = this; l !== null; l = l.parentNode)
      r.push(l);
    for (l = t; l !== null; l = l.parentNode)
      n.push(l);
    if (r.reverse(), n.reverse(), r[0] !== n[0])
      return ia + la;
    l = Math.min(r.length, n.length);
    for (var f2 = 1; f2 < l; f2++)
      if (r[f2] !== n[f2])
        return r[f2].index < n[f2].index ? oa : sa;
    return r.length < n.length ? oa + ca : sa + Gi;
  } }, isSameNode: { value: function(t) {
    return this === t;
  } }, isEqualNode: { value: function(t) {
    if (!t || t.nodeType !== this.nodeType || !this.isEqual(t))
      return false;
    for (var r = this.firstChild, n = t.firstChild; r && n; r = r.nextSibling, n = n.nextSibling)
      if (!r.isEqualNode(n))
        return false;
    return r === null && n === null;
  } }, cloneNode: { value: function(e2) {
    var t = this.clone();
    if (e2)
      for (var r = this.firstChild; r !== null; r = r.nextSibling)
        t._appendChild(r.cloneNode(true));
    return t;
  } }, lookupPrefix: { value: function(t) {
    var r;
    if (t === "" || t === null || t === void 0)
      return null;
    switch (this.nodeType) {
      case Me:
        return this._lookupNamespacePrefix(t, this);
      case dr:
        return r = this.documentElement, r ? r.lookupPrefix(t) : null;
      case na:
      case aa:
      case vt:
      case je:
        return null;
      case ra:
        return r = this.ownerElement, r ? r.lookupPrefix(t) : null;
      default:
        return r = this.parentElement, r ? r.lookupPrefix(t) : null;
    }
  } }, lookupNamespaceURI: { value: function(t) {
    (t === "" || t === void 0) && (t = null);
    var r;
    switch (this.nodeType) {
      case Me:
        return J.shouldOverride();
      case dr:
        return r = this.documentElement, r ? r.lookupNamespaceURI(t) : null;
      case na:
      case aa:
      case je:
      case vt:
        return null;
      case ra:
        return r = this.ownerElement, r ? r.lookupNamespaceURI(t) : null;
      default:
        return r = this.parentElement, r ? r.lookupNamespaceURI(t) : null;
    }
  } }, isDefaultNamespace: { value: function(t) {
    (t === "" || t === void 0) && (t = null);
    var r = this.lookupNamespaceURI(null);
    return r === t;
  } }, index: { get: function() {
    var e2 = this.parentNode;
    if (this === e2.firstChild)
      return 0;
    var t = e2.childNodes;
    if (this._index === void 0 || t[this._index] !== this) {
      for (var r = 0; r < t.length; r++)
        t[r]._index = r;
      J.assert(t[this._index] === this);
    }
    return this._index;
  } }, isAncestor: { value: function(e2) {
    if (this.doc !== e2.doc || this.rooted !== e2.rooted)
      return false;
    for (var t = e2; t; t = t.parentNode)
      if (t === this)
        return true;
    return false;
  } }, ensureSameDoc: { value: function(e2) {
    e2.ownerDocument === null ? e2.ownerDocument = this.doc : e2.ownerDocument !== this.doc && J.WrongDocumentError();
  } }, removeChildren: { value: J.shouldOverride }, _insertOrReplace: { value: function(t, r, n) {
    var l = this, f2, _;
    if (l.nodeType === vt && l.rooted && J.HierarchyRequestError(), t._childNodes && (f2 = r === null ? t._childNodes.length : r.index, l.parentNode === t)) {
      var y = l.index;
      y < f2 && f2--;
    }
    n && (r.rooted && r.doc.mutateRemove(r), r.parentNode = null);
    var w = r;
    w === null && (w = t.firstChild);
    var S = l.rooted && t.rooted;
    if (l.nodeType === vt) {
      for (var D = [0, n ? 1 : 0], ae, ce = l.firstChild; ce !== null; ce = ae)
        ae = ce.nextSibling, D.push(ce), ce.parentNode = t;
      var g2 = D.length;
      if (n ? Zr.replace(w, g2 > 2 ? D[2] : null) : g2 > 2 && w !== null && Zr.insertBefore(D[2], w), t._childNodes)
        for (D[0] = r === null ? t._childNodes.length : r._index, t._childNodes.splice.apply(t._childNodes, D), _ = 2; _ < g2; _++)
          D[_]._index = D[0] + (_ - 2);
      else
        t._firstChild === r && (g2 > 2 ? t._firstChild = D[2] : n && (t._firstChild = null));
      if (l._childNodes ? l._childNodes.length = 0 : l._firstChild = null, t.rooted)
        for (t.modify(), _ = 2; _ < g2; _++)
          t.doc.mutateInsert(D[_]);
    } else {
      if (r === l)
        return;
      S ? l._remove() : l.parentNode && l.remove(), l.parentNode = t, n ? (Zr.replace(w, l), t._childNodes ? (l._index = f2, t._childNodes[f2] = l) : t._firstChild === r && (t._firstChild = l)) : (w !== null && Zr.insertBefore(l, w), t._childNodes ? (l._index = f2, t._childNodes.splice(f2, 0, l)) : t._firstChild === r && (t._firstChild = l)), S ? (t.modify(), t.doc.mutateMove(l)) : t.rooted && (t.modify(), t.doc.mutateInsert(l));
    }
  } }, lastModTime: { get: function() {
    return this._lastModTime || (this._lastModTime = this.doc.modclock), this._lastModTime;
  } }, modify: { value: function() {
    if (this.doc.modclock)
      for (var e2 = ++this.doc.modclock, t = this; t; t = t.parentElement)
        t._lastModTime && (t._lastModTime = e2);
  } }, doc: { get: function() {
    return this.ownerDocument || this;
  } }, rooted: { get: function() {
    return !!this._nid;
  } }, normalize: { value: function() {
    for (var e2, t = this.firstChild; t !== null; t = e2)
      if (e2 = t.nextSibling, t.normalize && t.normalize(), t.nodeType === xe.TEXT_NODE) {
        if (t.nodeValue === "") {
          this.removeChild(t);
          continue;
        }
        var r = t.previousSibling;
        r !== null && r.nodeType === xe.TEXT_NODE && (r.appendData(t.nodeValue), this.removeChild(t));
      }
  } }, serialize: { value: function() {
    if (this._innerHTML)
      return this._innerHTML;
    for (var e2 = "", t = this.firstChild; t !== null; t = t.nextSibling)
      e2 += Vi.serializeOne(t, this);
    return e2;
  } }, outerHTML: { get: function() {
    return Vi.serializeOne(this, { nodeType: 0 });
  }, set: J.nyi }, ELEMENT_NODE: { value: Me }, ATTRIBUTE_NODE: { value: ra }, TEXT_NODE: { value: Jr }, CDATA_SECTION_NODE: { value: ou }, ENTITY_REFERENCE_NODE: { value: cu }, ENTITY_NODE: { value: na }, PROCESSING_INSTRUCTION_NODE: { value: zi }, COMMENT_NODE: { value: ji }, DOCUMENT_NODE: { value: dr }, DOCUMENT_TYPE_NODE: { value: je }, DOCUMENT_FRAGMENT_NODE: { value: vt }, NOTATION_NODE: { value: aa }, DOCUMENT_POSITION_DISCONNECTED: { value: ia }, DOCUMENT_POSITION_PRECEDING: { value: sa }, DOCUMENT_POSITION_FOLLOWING: { value: oa }, DOCUMENT_POSITION_CONTAINS: { value: Gi }, DOCUMENT_POSITION_CONTAINED_BY: { value: ca }, DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: { value: la } });
});
var Ki = O((kf, $i) => {
  $i.exports = class extends Array {
    constructor(t) {
      if (super(t && t.length || 0), t)
        for (var r in t)
          this[r] = t[r];
    }
    item(t) {
      return this[t] || null;
    }
  };
});
var Qi = O((Sf, Xi) => {
  function lu(e2) {
    return this[e2] || null;
  }
  function uu(e2) {
    return e2 || (e2 = []), e2.item = lu, e2;
  }
  Xi.exports = uu;
});
var It = O((Nf, Zi) => {
  var ua;
  try {
    ua = Ki();
  } catch (e2) {
    ua = Qi();
  }
  Zi.exports = ua;
});
var en = O((Cf, ts) => {
  ts.exports = es;
  var Ji = Te(), fu = It();
  function es() {
    Ji.call(this), this._firstChild = this._childNodes = null;
  }
  es.prototype = Object.create(Ji.prototype, { hasChildNodes: { value: function() {
    return this._childNodes ? this._childNodes.length > 0 : this._firstChild !== null;
  } }, childNodes: { get: function() {
    return this._ensureChildNodes(), this._childNodes;
  } }, firstChild: { get: function() {
    return this._childNodes ? this._childNodes.length === 0 ? null : this._childNodes[0] : this._firstChild;
  } }, lastChild: { get: function() {
    var e2 = this._childNodes, t;
    return e2 ? e2.length === 0 ? null : e2[e2.length - 1] : (t = this._firstChild, t === null ? null : t._previousSibling);
  } }, _ensureChildNodes: { value: function() {
    if (!this._childNodes) {
      var e2 = this._firstChild, t = e2, r = this._childNodes = new fu();
      if (e2)
        do
          r.push(t), t = t._nextSibling;
        while (t !== e2);
      this._firstChild = null;
    }
  } }, removeChildren: { value: function() {
    for (var t = this.rooted ? this.ownerDocument : null, r = this.firstChild, n; r !== null; )
      n = r, r = n.nextSibling, t && t.mutateRemove(n), n.parentNode = null;
    this._childNodes ? this._childNodes.length = 0 : this._firstChild = null, this.modify();
  } } });
});
var tn = O((ha) => {
  ha.isValidName = bu;
  ha.isValidQName = _u;
  var du = /^[_:A-Za-z][-.:\w]+$/, hu = /^([_A-Za-z][-.\w]+|[_A-Za-z][-.\w]+:[_A-Za-z][-.\w]+)$/, hr = "_A-Za-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD", xr = "-._A-Za-z0-9\xB7\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0300-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD", Ot = "[" + hr + "][" + xr + "]*", fa = hr + ":", da = xr + ":", xu = new RegExp("^[" + fa + "][" + da + "]*$"), pu = new RegExp("^(" + Ot + "|" + Ot + ":" + Ot + ")$"), rs = /[\uD800-\uDB7F\uDC00-\uDFFF]/, ns = /[\uD800-\uDB7F\uDC00-\uDFFF]/g, as = /[\uD800-\uDB7F][\uDC00-\uDFFF]/g;
  hr += "\uD800-\u{EFC00}-\uDFFF";
  xr += "\uD800-\u{EFC00}-\uDFFF";
  Ot = "[" + hr + "][" + xr + "]*";
  fa = hr + ":";
  da = xr + ":";
  var mu = new RegExp("^[" + fa + "][" + da + "]*$"), gu = new RegExp("^(" + Ot + "|" + Ot + ":" + Ot + ")$");
  function bu(e2) {
    if (du.test(e2) || xu.test(e2))
      return true;
    if (!rs.test(e2) || !mu.test(e2))
      return false;
    var t = e2.match(ns), r = e2.match(as);
    return r !== null && 2 * r.length === t.length;
  }
  function _u(e2) {
    if (hu.test(e2) || pu.test(e2))
      return true;
    if (!rs.test(e2) || !gu.test(e2))
      return false;
    var t = e2.match(ns), r = e2.match(as);
    return r !== null && 2 * r.length === t.length;
  }
});
var pa = O((xa) => {
  var is = he();
  xa.property = function(e2) {
    if (Array.isArray(e2.type)) {
      var t = /* @__PURE__ */ Object.create(null);
      e2.type.forEach(function(l) {
        t[l.value || l] = l.alias || l;
      });
      var r = e2.missing;
      r === void 0 && (r = null);
      var n = e2.invalid;
      return n === void 0 && (n = r), { get: function() {
        var l = this._getattr(e2.name);
        return l === null ? r : (l = t[l.toLowerCase()], l !== void 0 ? l : n !== null ? n : l);
      }, set: function(l) {
        this._setattr(e2.name, l);
      } };
    } else {
      if (e2.type === Boolean)
        return { get: function() {
          return this.hasAttribute(e2.name);
        }, set: function(l) {
          l ? this._setattr(e2.name, "") : this.removeAttribute(e2.name);
        } };
      if (e2.type === Number || e2.type === "long" || e2.type === "unsigned long" || e2.type === "limited unsigned long with fallback")
        return Eu(e2);
      if (!e2.type || e2.type === String)
        return { get: function() {
          return this._getattr(e2.name) || "";
        }, set: function(l) {
          e2.treatNullAsEmptyString && l === null && (l = ""), this._setattr(e2.name, l);
        } };
      if (typeof e2.type == "function")
        return e2.type(e2.name, e2);
    }
    throw new Error("Invalid attribute definition");
  };
  function Eu(e2) {
    var t;
    typeof e2.default == "function" ? t = e2.default : typeof e2.default == "number" ? t = function() {
      return e2.default;
    } : t = function() {
      is.assert(false, typeof e2.default);
    };
    var r = e2.type === "unsigned long", n = e2.type === "long", l = e2.type === "limited unsigned long with fallback", f2 = e2.min, _ = e2.max, y = e2.setmin;
    return f2 === void 0 && (r && (f2 = 0), n && (f2 = -2147483648), l && (f2 = 1)), _ === void 0 && (r || n || l) && (_ = 2147483647), { get: function() {
      var w = this._getattr(e2.name), S = e2.float ? parseFloat(w) : parseInt(w, 10);
      if (w === null || !isFinite(S) || f2 !== void 0 && S < f2 || _ !== void 0 && S > _)
        return t.call(this);
      if (r || n || l) {
        if (!/^[ \t\n\f\r]*[-+]?[0-9]/.test(w))
          return t.call(this);
        S = S | 0;
      }
      return S;
    }, set: function(w) {
      e2.float || (w = Math.floor(w)), y !== void 0 && w < y && is.IndexSizeError(e2.name + " set to " + w), r ? w = w < 0 || w > 2147483647 ? t.call(this) : w | 0 : l ? w = w < 1 || w > 2147483647 ? t.call(this) : w | 0 : n && (w = w < -2147483648 || w > 2147483647 ? t.call(this) : w | 0), this._setattr(e2.name, String(w));
    } };
  }
  xa.registerChangeHandler = function(e2, t, r) {
    var n = e2.prototype;
    Object.prototype.hasOwnProperty.call(n, "_attributeChangeHandlers") || (n._attributeChangeHandlers = Object.create(n._attributeChangeHandlers || null)), n._attributeChangeHandlers[t] = r;
  };
});
var cs = O((Df, os) => {
  os.exports = ss;
  var vu = Te();
  function ss(e2, t) {
    this.root = e2, this.filter = t, this.lastModTime = e2.lastModTime, this.done = false, this.cache = [], this.traverse();
  }
  ss.prototype = Object.create(Object.prototype, { length: { get: function() {
    return this.checkcache(), this.done || this.traverse(), this.cache.length;
  } }, item: { value: function(e2) {
    return this.checkcache(), !this.done && e2 >= this.cache.length && this.traverse(), this.cache[e2];
  } }, checkcache: { value: function() {
    if (this.lastModTime !== this.root.lastModTime) {
      for (var e2 = this.cache.length - 1; e2 >= 0; e2--)
        this[e2] = void 0;
      this.cache.length = 0, this.done = false, this.lastModTime = this.root.lastModTime;
    }
  } }, traverse: { value: function(e2) {
    e2 !== void 0 && e2++;
    for (var t; (t = this.next()) !== null; )
      if (this[this.cache.length] = t, this.cache.push(t), e2 && this.cache.length === e2)
        return;
    this.done = true;
  } }, next: { value: function() {
    var e2 = this.cache.length === 0 ? this.root : this.cache[this.cache.length - 1], t;
    for (e2.nodeType === vu.DOCUMENT_NODE ? t = e2.documentElement : t = e2.nextElement(this.root); t; ) {
      if (this.filter(t))
        return t;
      t = t.nextElement(this.root);
    }
    return null;
  } } });
});
var ga = O((Mf, fs) => {
  var ma = he();
  fs.exports = us;
  function us(e2, t) {
    this._getString = e2, this._setString = t, this._length = 0, this._lastStringValue = "", this._update();
  }
  Object.defineProperties(us.prototype, { length: { get: function() {
    return this._length;
  } }, item: { value: function(e2) {
    var t = zt(this);
    return e2 < 0 || e2 >= t.length ? null : t[e2];
  } }, contains: { value: function(e2) {
    e2 = String(e2);
    var t = zt(this);
    return t.indexOf(e2) > -1;
  } }, add: { value: function() {
    for (var e2 = zt(this), t = 0, r = arguments.length; t < r; t++) {
      var n = pr(arguments[t]);
      e2.indexOf(n) < 0 && e2.push(n);
    }
    this._update(e2);
  } }, remove: { value: function() {
    for (var e2 = zt(this), t = 0, r = arguments.length; t < r; t++) {
      var n = pr(arguments[t]), l = e2.indexOf(n);
      l > -1 && e2.splice(l, 1);
    }
    this._update(e2);
  } }, toggle: { value: function(t, r) {
    return t = pr(t), this.contains(t) ? r === void 0 || r === false ? (this.remove(t), false) : true : r === void 0 || r === true ? (this.add(t), true) : false;
  } }, replace: { value: function(t, r) {
    String(r) === "" && ma.SyntaxError(), t = pr(t), r = pr(r);
    var n = zt(this), l = n.indexOf(t);
    if (l < 0)
      return false;
    var f2 = n.indexOf(r);
    return f2 < 0 ? n[l] = r : l < f2 ? (n[l] = r, n.splice(f2, 1)) : n.splice(l, 1), this._update(n), true;
  } }, toString: { value: function() {
    return this._getString();
  } }, value: { get: function() {
    return this._getString();
  }, set: function(e2) {
    this._setString(e2), this._update();
  } }, _update: { value: function(e2) {
    e2 ? (ls(this, e2), this._setString(e2.join(" ").trim())) : ls(this, zt(this)), this._lastStringValue = this._getString();
  } } });
  function ls(e2, t) {
    var r = e2._length, n;
    for (e2._length = t.length, n = 0; n < t.length; n++)
      e2[n] = t[n];
    for (; n < r; n++)
      e2[n] = void 0;
  }
  function pr(e2) {
    return e2 = String(e2), e2 === "" && ma.SyntaxError(), /[ \t\r\n\f]/.test(e2) && ma.InvalidCharacterError(), e2;
  }
  function yu(e2) {
    for (var t = e2._length, r = Array(t), n = 0; n < t; n++)
      r[n] = e2[n];
    return r;
  }
  function zt(e2) {
    var t = e2._getString();
    if (t === e2._lastStringValue)
      return yu(e2);
    var r = t.replace(/(^[ \t\r\n\f]+)|([ \t\r\n\f]+$)/g, "");
    if (r === "")
      return [];
    var n = /* @__PURE__ */ Object.create(null);
    return r.split(/[ \t\r\n\f]+/g).filter(function(l) {
      var f2 = "$" + l;
      return n[f2] ? false : (n[f2] = true, true);
    });
  }
});
var sn = O((Wt, gs) => {
  var rn = Object.create(null, { location: { get: function() {
    throw new Error("window.location is not supported.");
  } } }), Tu = function(e2, t) {
    return e2.compareDocumentPosition(t);
  }, wu = function(e2, t) {
    return Tu(e2, t) & 2 ? 1 : -1;
  }, an = function(e2) {
    for (; (e2 = e2.nextSibling) && e2.nodeType !== 1; )
      ;
    return e2;
  }, Gt = function(e2) {
    for (; (e2 = e2.previousSibling) && e2.nodeType !== 1; )
      ;
    return e2;
  }, ku = function(e2) {
    if (e2 = e2.firstChild)
      for (; e2.nodeType !== 1 && (e2 = e2.nextSibling); )
        ;
    return e2;
  }, Su = function(e2) {
    if (e2 = e2.lastChild)
      for (; e2.nodeType !== 1 && (e2 = e2.previousSibling); )
        ;
    return e2;
  }, jt = function(e2) {
    if (!e2.parentNode)
      return false;
    var t = e2.parentNode.nodeType;
    return t === 1 || t === 9;
  }, ds = function(e2) {
    if (!e2)
      return e2;
    var t = e2[0];
    return t === '"' || t === "'" ? (e2[e2.length - 1] === t ? e2 = e2.slice(1, -1) : e2 = e2.slice(1), e2.replace(P.str_escape, function(r) {
      var n = /^\\(?:([0-9A-Fa-f]+)|([\r\n\f]+))/.exec(r);
      if (!n)
        return r.slice(1);
      if (n[2])
        return "";
      var l = parseInt(n[1], 16);
      return String.fromCodePoint ? String.fromCodePoint(l) : String.fromCharCode(l);
    })) : P.ident.test(e2) ? yt(e2) : e2;
  }, yt = function(e2) {
    return e2.replace(P.escape, function(t) {
      var r = /^\\([0-9A-Fa-f]+)/.exec(t);
      if (!r)
        return t[1];
      var n = parseInt(r[1], 16);
      return String.fromCodePoint ? String.fromCodePoint(n) : String.fromCharCode(n);
    });
  }, Nu = function() {
    return Array.prototype.indexOf ? Array.prototype.indexOf : function(e2, t) {
      for (var r = this.length; r--; )
        if (this[r] === t)
          return r;
      return -1;
    };
  }(), xs = function(e2, t) {
    var r = P.inside.source.replace(/</g, e2).replace(/>/g, t);
    return new RegExp(r);
  }, Re = function(e2, t, r) {
    return e2 = e2.source, e2 = e2.replace(t, r.source || r), new RegExp(e2);
  }, hs = function(e2, t) {
    return e2.replace(/^(?:\w+:\/\/|\/+)/, "").replace(/(?:\/+|\/*#.*?)$/, "").split("/", t).join("/");
  }, Cu = function(e2, t) {
    var r = e2.replace(/\s+/g, ""), n;
    return r === "even" ? r = "2n+0" : r === "odd" ? r = "2n+1" : r.indexOf("n") === -1 && (r = "0n" + r), n = /^([+-])?(\d+)?n([+-])?(\d+)?$/.exec(r), { group: n[1] === "-" ? -(n[2] || 1) : +(n[2] || 1), offset: n[4] ? n[3] === "-" ? -n[4] : +n[4] : 0 };
  }, ba = function(e2, t, r) {
    var n = Cu(e2), l = n.group, f2 = n.offset, _ = r ? Su : ku, y = r ? Gt : an;
    return function(w) {
      if (!!jt(w))
        for (var S = _(w.parentNode), D = 0; S; ) {
          if (t(S, w) && D++, S === w)
            return D -= f2, l && D ? D % l === 0 && D < 0 == l < 0 : !D;
          S = y(S);
        }
    };
  }, _e = { "*": function() {
    return function() {
      return true;
    };
  }(), type: function(e2) {
    return e2 = e2.toLowerCase(), function(t) {
      return t.nodeName.toLowerCase() === e2;
    };
  }, attr: function(e2, t, r, n) {
    return t = ps[t], function(l) {
      var f2;
      switch (e2) {
        case "for":
          f2 = l.htmlFor;
          break;
        case "class":
          f2 = l.className, f2 === "" && l.getAttribute("class") == null && (f2 = null);
          break;
        case "href":
        case "src":
          f2 = l.getAttribute(e2, 2);
          break;
        case "title":
          f2 = l.getAttribute("title") || null;
          break;
        case "id":
        case "lang":
        case "dir":
        case "accessKey":
        case "hidden":
        case "tabIndex":
        case "style":
          if (l.getAttribute) {
            f2 = l.getAttribute(e2);
            break;
          }
        default:
          if (l.hasAttribute && !l.hasAttribute(e2))
            break;
          f2 = l[e2] != null ? l[e2] : l.getAttribute && l.getAttribute(e2);
          break;
      }
      if (f2 != null)
        return f2 = f2 + "", n && (f2 = f2.toLowerCase(), r = r.toLowerCase()), t(f2, r);
    };
  }, ":first-child": function(e2) {
    return !Gt(e2) && jt(e2);
  }, ":last-child": function(e2) {
    return !an(e2) && jt(e2);
  }, ":only-child": function(e2) {
    return !Gt(e2) && !an(e2) && jt(e2);
  }, ":nth-child": function(e2, t) {
    return ba(e2, function() {
      return true;
    }, t);
  }, ":nth-last-child": function(e2) {
    return _e[":nth-child"](e2, true);
  }, ":root": function(e2) {
    return e2.ownerDocument.documentElement === e2;
  }, ":empty": function(e2) {
    return !e2.firstChild;
  }, ":not": function(e2) {
    var t = Ea(e2);
    return function(r) {
      return !t(r);
    };
  }, ":first-of-type": function(e2) {
    if (!!jt(e2)) {
      for (var t = e2.nodeName; e2 = Gt(e2); )
        if (e2.nodeName === t)
          return;
      return true;
    }
  }, ":last-of-type": function(e2) {
    if (!!jt(e2)) {
      for (var t = e2.nodeName; e2 = an(e2); )
        if (e2.nodeName === t)
          return;
      return true;
    }
  }, ":only-of-type": function(e2) {
    return _e[":first-of-type"](e2) && _e[":last-of-type"](e2);
  }, ":nth-of-type": function(e2, t) {
    return ba(e2, function(r, n) {
      return r.nodeName === n.nodeName;
    }, t);
  }, ":nth-last-of-type": function(e2) {
    return _e[":nth-of-type"](e2, true);
  }, ":checked": function(e2) {
    return !!(e2.checked || e2.selected);
  }, ":indeterminate": function(e2) {
    return !_e[":checked"](e2);
  }, ":enabled": function(e2) {
    return !e2.disabled && e2.type !== "hidden";
  }, ":disabled": function(e2) {
    return !!e2.disabled;
  }, ":target": function(e2) {
    return e2.id === rn.location.hash.substring(1);
  }, ":focus": function(e2) {
    return e2 === e2.ownerDocument.activeElement;
  }, ":is": function(e2) {
    return Ea(e2);
  }, ":matches": function(e2) {
    return _e[":is"](e2);
  }, ":nth-match": function(e2, t) {
    var r = e2.split(/\s*,\s*/), n = r.shift(), l = Ea(r.join(","));
    return ba(n, l, t);
  }, ":nth-last-match": function(e2) {
    return _e[":nth-match"](e2, true);
  }, ":links-here": function(e2) {
    return e2 + "" == rn.location + "";
  }, ":lang": function(e2) {
    return function(t) {
      for (; t; ) {
        if (t.lang)
          return t.lang.indexOf(e2) === 0;
        t = t.parentNode;
      }
    };
  }, ":dir": function(e2) {
    return function(t) {
      for (; t; ) {
        if (t.dir)
          return t.dir === e2;
        t = t.parentNode;
      }
    };
  }, ":scope": function(e2, t) {
    var r = t || e2.ownerDocument;
    return r.nodeType === 9 ? e2 === r.documentElement : e2 === r;
  }, ":any-link": function(e2) {
    return typeof e2.href == "string";
  }, ":local-link": function(e2) {
    if (e2.nodeName)
      return e2.href && e2.host === rn.location.host;
    var t = +e2 + 1;
    return function(r) {
      if (!!r.href) {
        var n = rn.location + "", l = r + "";
        return hs(n, t) === hs(l, t);
      }
    };
  }, ":default": function(e2) {
    return !!e2.defaultSelected;
  }, ":valid": function(e2) {
    return e2.willValidate || e2.validity && e2.validity.valid;
  }, ":invalid": function(e2) {
    return !_e[":valid"](e2);
  }, ":in-range": function(e2) {
    return e2.value > e2.min && e2.value <= e2.max;
  }, ":out-of-range": function(e2) {
    return !_e[":in-range"](e2);
  }, ":required": function(e2) {
    return !!e2.required;
  }, ":optional": function(e2) {
    return !e2.required;
  }, ":read-only": function(e2) {
    if (e2.readOnly)
      return true;
    var t = e2.getAttribute("contenteditable"), r = e2.contentEditable, n = e2.nodeName.toLowerCase();
    return n = n !== "input" && n !== "textarea", (n || e2.disabled) && t == null && r !== "true";
  }, ":read-write": function(e2) {
    return !_e[":read-only"](e2);
  }, ":hover": function() {
    throw new Error(":hover is not supported.");
  }, ":active": function() {
    throw new Error(":active is not supported.");
  }, ":link": function() {
    throw new Error(":link is not supported.");
  }, ":visited": function() {
    throw new Error(":visited is not supported.");
  }, ":column": function() {
    throw new Error(":column is not supported.");
  }, ":nth-column": function() {
    throw new Error(":nth-column is not supported.");
  }, ":nth-last-column": function() {
    throw new Error(":nth-last-column is not supported.");
  }, ":current": function() {
    throw new Error(":current is not supported.");
  }, ":past": function() {
    throw new Error(":past is not supported.");
  }, ":future": function() {
    throw new Error(":future is not supported.");
  }, ":contains": function(e2) {
    return function(t) {
      var r = t.innerText || t.textContent || t.value || "";
      return r.indexOf(e2) !== -1;
    };
  }, ":has": function(e2) {
    return function(t) {
      return ms(e2, t).length > 0;
    };
  } }, ps = { "-": function() {
    return true;
  }, "=": function(e2, t) {
    return e2 === t;
  }, "*=": function(e2, t) {
    return e2.indexOf(t) !== -1;
  }, "~=": function(e2, t) {
    var r, n, l, f2;
    for (n = 0; ; n = r + 1) {
      if (r = e2.indexOf(t, n), r === -1)
        return false;
      if (l = e2[r - 1], f2 = e2[r + t.length], (!l || l === " ") && (!f2 || f2 === " "))
        return true;
    }
  }, "|=": function(e2, t) {
    var r = e2.indexOf(t), n;
    if (r === 0)
      return n = e2[r + t.length], n === "-" || !n;
  }, "^=": function(e2, t) {
    return e2.indexOf(t) === 0;
  }, "$=": function(e2, t) {
    var r = e2.lastIndexOf(t);
    return r !== -1 && r + t.length === e2.length;
  }, "!=": function(e2, t) {
    return e2 !== t;
  } }, mr = { " ": function(e2) {
    return function(t) {
      for (; t = t.parentNode; )
        if (e2(t))
          return t;
    };
  }, ">": function(e2) {
    return function(t) {
      if (t = t.parentNode)
        return e2(t) && t;
    };
  }, "+": function(e2) {
    return function(t) {
      if (t = Gt(t))
        return e2(t) && t;
    };
  }, "~": function(e2) {
    return function(t) {
      for (; t = Gt(t); )
        if (e2(t))
          return t;
    };
  }, noop: function(e2) {
    return function(t) {
      return e2(t) && t;
    };
  }, ref: function(e2, t) {
    var r;
    function n(l) {
      for (var f2 = l.ownerDocument, _ = f2.getElementsByTagName("*"), y = _.length; y--; )
        if (r = _[y], n.test(l))
          return r = null, true;
      r = null;
    }
    return n.combinator = function(l) {
      if (!(!r || !r.getAttribute)) {
        var f2 = r.getAttribute(t) || "";
        if (f2[0] === "#" && (f2 = f2.substring(1)), f2 === l.id && e2(r))
          return r;
      }
    }, n;
  } }, P = { escape: /\\(?:[^0-9A-Fa-f\r\n]|[0-9A-Fa-f]{1,6}[\r\n\t ]?)/g, str_escape: /(escape)|\\(\n|\r\n?|\f)/g, nonascii: /[\u00A0-\uFFFF]/, cssid: /(?:(?!-?[0-9])(?:escape|nonascii|[-_a-zA-Z0-9])+)/, qname: /^ *(cssid|\*)/, simple: /^(?:([.#]cssid)|pseudo|attr)/, ref: /^ *\/(cssid)\/ */, combinator: /^(?: +([^ \w*.#\\]) +|( )+|([^ \w*.#\\]))(?! *$)/, attr: /^\[(cssid)(?:([^\w]?=)(inside))?\]/, pseudo: /^(:cssid)(?:\((inside)\))?/, inside: /(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|<[^"'>]*>|\\["'>]|[^"'>])*/, ident: /^(cssid)$/ };
  P.cssid = Re(P.cssid, "nonascii", P.nonascii);
  P.cssid = Re(P.cssid, "escape", P.escape);
  P.qname = Re(P.qname, "cssid", P.cssid);
  P.simple = Re(P.simple, "cssid", P.cssid);
  P.ref = Re(P.ref, "cssid", P.cssid);
  P.attr = Re(P.attr, "cssid", P.cssid);
  P.pseudo = Re(P.pseudo, "cssid", P.cssid);
  P.inside = Re(P.inside, `[^"'>]*`, P.inside);
  P.attr = Re(P.attr, "inside", xs("\\[", "\\]"));
  P.pseudo = Re(P.pseudo, "inside", xs("\\(", "\\)"));
  P.simple = Re(P.simple, "pseudo", P.pseudo);
  P.simple = Re(P.simple, "attr", P.attr);
  P.ident = Re(P.ident, "cssid", P.cssid);
  P.str_escape = Re(P.str_escape, "escape", P.escape);
  var gr = function(e2) {
    for (var t = e2.replace(/^\s+|\s+$/g, ""), r, n = [], l = [], f2, _, y, w, S; t; ) {
      if (y = P.qname.exec(t))
        t = t.substring(y[0].length), _ = yt(y[1]), l.push(nn(_, true));
      else if (y = P.simple.exec(t))
        t = t.substring(y[0].length), _ = "*", l.push(nn(_, true)), l.push(nn(y));
      else
        throw new SyntaxError("Invalid selector.");
      for (; y = P.simple.exec(t); )
        t = t.substring(y[0].length), l.push(nn(y));
      if (t[0] === "!" && (t = t.substring(1), f2 = Lu(), f2.qname = _, l.push(f2.simple)), y = P.ref.exec(t)) {
        t = t.substring(y[0].length), S = mr.ref(_a(l), yt(y[1])), n.push(S.combinator), l = [];
        continue;
      }
      if (y = P.combinator.exec(t)) {
        if (t = t.substring(y[0].length), w = y[1] || y[2] || y[3], w === ",") {
          n.push(mr.noop(_a(l)));
          break;
        }
      } else
        w = "noop";
      if (!mr[w])
        throw new SyntaxError("Bad combinator.");
      n.push(mr[w](_a(l))), l = [];
    }
    return r = Au(n), r.qname = _, r.sel = t, f2 && (f2.lname = r.qname, f2.test = r, f2.qname = f2.qname, f2.sel = r.sel, r = f2), S && (S.test = r, S.qname = r.qname, S.sel = r.sel, r = S), r;
  }, nn = function(e2, t) {
    if (t)
      return e2 === "*" ? _e["*"] : _e.type(e2);
    if (e2[1])
      return e2[1][0] === "." ? _e.attr("class", "~=", yt(e2[1].substring(1)), false) : _e.attr("id", "=", yt(e2[1].substring(1)), false);
    if (e2[2])
      return e2[3] ? _e[yt(e2[2])](ds(e2[3])) : _e[yt(e2[2])];
    if (e2[4]) {
      var r = e2[6], n = /["'\s]\s*I$/i.test(r);
      return n && (r = r.replace(/\s*I$/i, "")), _e.attr(yt(e2[4]), e2[5] || "-", ds(r), n);
    }
    throw new SyntaxError("Unknown Selector.");
  }, _a = function(e2) {
    var t = e2.length, r;
    return t < 2 ? e2[0] : function(n) {
      if (!!n) {
        for (r = 0; r < t; r++)
          if (!e2[r](n))
            return;
        return true;
      }
    };
  }, Au = function(e2) {
    return e2.length < 2 ? function(t) {
      return !!e2[0](t);
    } : function(t) {
      for (var r = e2.length; r--; )
        if (!(t = e2[r](t)))
          return;
      return true;
    };
  }, Lu = function() {
    var e2;
    function t(r) {
      for (var n = r.ownerDocument, l = n.getElementsByTagName(t.lname), f2 = l.length; f2--; )
        if (t.test(l[f2]) && e2 === r)
          return e2 = null, true;
      e2 = null;
    }
    return t.simple = function(r) {
      return e2 = r, true;
    }, t;
  }, Ea = function(e2) {
    for (var t = gr(e2), r = [t]; t.sel; )
      t = gr(t.sel), r.push(t);
    return r.length < 2 ? t : function(n) {
      for (var l = r.length, f2 = 0; f2 < l; f2++)
        if (r[f2](n))
          return true;
    };
  }, ms = function(e2, t) {
    for (var r = [], n = gr(e2), l = t.getElementsByTagName(n.qname), f2 = 0, _; _ = l[f2++]; )
      n(_) && r.push(_);
    if (n.sel) {
      for (; n.sel; )
        for (n = gr(n.sel), l = t.getElementsByTagName(n.qname), f2 = 0; _ = l[f2++]; )
          n(_) && Nu.call(r, _) === -1 && r.push(_);
      r.sort(wu);
    }
    return r;
  };
  gs.exports = Wt = function(e2, t) {
    var r, n;
    if (t.nodeType !== 11 && e2.indexOf(" ") === -1) {
      if (e2[0] === "#" && t.rooted && /^#[A-Z_][-A-Z0-9_]*$/i.test(e2) && t.doc._hasMultipleElementsWithId && (r = e2.substring(1), !t.doc._hasMultipleElementsWithId(r)))
        return n = t.doc.getElementById(r), n ? [n] : [];
      if (e2[0] === "." && /^\.\w+$/.test(e2))
        return t.getElementsByClassName(e2.substring(1));
      if (/^\w+$/.test(e2))
        return t.getElementsByTagName(e2);
    }
    return ms(e2, t);
  };
  Wt.selectors = _e;
  Wt.operators = ps;
  Wt.combinators = mr;
  Wt.matches = function(e2, t) {
    var r = { sel: t };
    do
      if (r = gr(r.sel), r(e2))
        return true;
    while (r.sel);
    return false;
  };
});
var on = O((Rf, bs) => {
  var Du = Te(), Mu = ea(), va = function(e2, t) {
    for (var r = e2.createDocumentFragment(), n = 0; n < t.length; n++) {
      var l = t[n], f2 = l instanceof Du;
      r.appendChild(f2 ? l : e2.createTextNode(String(l)));
    }
    return r;
  }, Ru = { after: { value: function() {
    var t = Array.prototype.slice.call(arguments), r = this.parentNode, n = this.nextSibling;
    if (r !== null) {
      for (; n && t.some(function(f2) {
        return f2 === n;
      }); )
        n = n.nextSibling;
      var l = va(this.doc, t);
      r.insertBefore(l, n);
    }
  } }, before: { value: function() {
    var t = Array.prototype.slice.call(arguments), r = this.parentNode, n = this.previousSibling;
    if (r !== null) {
      for (; n && t.some(function(_) {
        return _ === n;
      }); )
        n = n.previousSibling;
      var l = va(this.doc, t), f2 = n ? n.nextSibling : r.firstChild;
      r.insertBefore(l, f2);
    }
  } }, remove: { value: function() {
    this.parentNode !== null && (this.doc && (this.doc._preremoveNodeIterators(this), this.rooted && this.doc.mutateRemove(this)), this._remove(), this.parentNode = null);
  } }, _remove: { value: function() {
    var t = this.parentNode;
    t !== null && (t._childNodes ? t._childNodes.splice(this.index, 1) : t._firstChild === this && (this._nextSibling === this ? t._firstChild = null : t._firstChild = this._nextSibling), Mu.remove(this), t.modify());
  } }, replaceWith: { value: function() {
    var t = Array.prototype.slice.call(arguments), r = this.parentNode, n = this.nextSibling;
    if (r !== null) {
      for (; n && t.some(function(f2) {
        return f2 === n;
      }); )
        n = n.nextSibling;
      var l = va(this.doc, t);
      this.parentNode === r ? r.replaceChild(l, this) : r.insertBefore(l, n);
    }
  } } };
  bs.exports = Ru;
});
var ya = O((If, Es) => {
  var _s = Te(), Iu = { nextElementSibling: { get: function() {
    if (this.parentNode) {
      for (var e2 = this.nextSibling; e2 !== null; e2 = e2.nextSibling)
        if (e2.nodeType === _s.ELEMENT_NODE)
          return e2;
    }
    return null;
  } }, previousElementSibling: { get: function() {
    if (this.parentNode) {
      for (var e2 = this.previousSibling; e2 !== null; e2 = e2.previousSibling)
        if (e2.nodeType === _s.ELEMENT_NODE)
          return e2;
    }
    return null;
  } } };
  Es.exports = Iu;
});
var Ta = O((Of, ys) => {
  ys.exports = vs;
  var Yt = he();
  function vs(e2) {
    this.element = e2;
  }
  Object.defineProperties(vs.prototype, { length: { get: Yt.shouldOverride }, item: { value: Yt.shouldOverride }, getNamedItem: { value: function(t) {
    return this.element.getAttributeNode(t);
  } }, getNamedItemNS: { value: function(t, r) {
    return this.element.getAttributeNodeNS(t, r);
  } }, setNamedItem: { value: Yt.nyi }, setNamedItemNS: { value: Yt.nyi }, removeNamedItem: { value: function(t) {
    var r = this.element.getAttributeNode(t);
    if (r)
      return this.element.removeAttribute(t), r;
    Yt.NotFoundError();
  } }, removeNamedItemNS: { value: function(t, r) {
    var n = this.element.getAttributeNodeNS(t, r);
    if (n)
      return this.element.removeAttributeNS(t, r), n;
    Yt.NotFoundError();
  } } });
});
var Kt = O((qf, Cs) => {
  Cs.exports = Tt;
  var wa = tn(), ue = he(), tt = ue.NAMESPACE, ln = pa(), Ie = Te(), ka = It(), Ou = ta(), cn = cs(), $t = Xr(), qu = ga(), Sa = sn(), ws = en(), Hu = on(), Fu = ya(), ks = Ta(), Ts = /* @__PURE__ */ Object.create(null);
  function Tt(e2, t, r, n) {
    ws.call(this), this.nodeType = Ie.ELEMENT_NODE, this.ownerDocument = e2, this.localName = t, this.namespaceURI = r, this.prefix = n, this._tagName = void 0, this._attrsByQName = /* @__PURE__ */ Object.create(null), this._attrsByLName = /* @__PURE__ */ Object.create(null), this._attrKeys = [];
  }
  function Ss(e2, t) {
    if (e2.nodeType === Ie.TEXT_NODE)
      t.push(e2._data);
    else
      for (var r = 0, n = e2.childNodes.length; r < n; r++)
        Ss(e2.childNodes[r], t);
  }
  Tt.prototype = Object.create(ws.prototype, { isHTML: { get: function() {
    return this.namespaceURI === tt.HTML && this.ownerDocument.isHTML;
  } }, tagName: { get: function() {
    if (this._tagName === void 0) {
      var t;
      if (this.prefix === null ? t = this.localName : t = this.prefix + ":" + this.localName, this.isHTML) {
        var r = Ts[t];
        r || (Ts[t] = r = ue.toASCIIUpperCase(t)), t = r;
      }
      this._tagName = t;
    }
    return this._tagName;
  } }, nodeName: { get: function() {
    return this.tagName;
  } }, nodeValue: { get: function() {
    return null;
  }, set: function() {
  } }, textContent: { get: function() {
    var e2 = [];
    return Ss(this, e2), e2.join("");
  }, set: function(e2) {
    this.removeChildren(), e2 != null && e2 !== "" && this._appendChild(this.ownerDocument.createTextNode(e2));
  } }, innerHTML: { get: function() {
    return this.serialize();
  }, set: ue.nyi }, outerHTML: { get: function() {
    return Ou.serializeOne(this, { nodeType: 0 });
  }, set: function(e2) {
    var t = this.ownerDocument, r = this.parentNode;
    if (r !== null) {
      r.nodeType === Ie.DOCUMENT_NODE && ue.NoModificationAllowedError(), r.nodeType === Ie.DOCUMENT_FRAGMENT_NODE && (r = r.ownerDocument.createElement("body"));
      var n = t.implementation.mozHTMLParser(t._address, r);
      n.parse(e2 === null ? "" : String(e2), true), this.replaceWith(n._asDocumentFragment());
    }
  } }, _insertAdjacent: { value: function(t, r) {
    var n = false;
    switch (t) {
      case "beforebegin":
        n = true;
      case "afterend":
        var l = this.parentNode;
        return l === null ? null : l.insertBefore(r, n ? this : this.nextSibling);
      case "afterbegin":
        n = true;
      case "beforeend":
        return this.insertBefore(r, n ? this.firstChild : null);
      default:
        return ue.SyntaxError();
    }
  } }, insertAdjacentElement: { value: function(t, r) {
    if (r.nodeType !== Ie.ELEMENT_NODE)
      throw new TypeError("not an element");
    return t = ue.toASCIILowerCase(String(t)), this._insertAdjacent(t, r);
  } }, insertAdjacentText: { value: function(t, r) {
    var n = this.ownerDocument.createTextNode(r);
    t = ue.toASCIILowerCase(String(t)), this._insertAdjacent(t, n);
  } }, insertAdjacentHTML: { value: function(t, r) {
    t = ue.toASCIILowerCase(String(t)), r = String(r);
    var n;
    switch (t) {
      case "beforebegin":
      case "afterend":
        n = this.parentNode, (n === null || n.nodeType === Ie.DOCUMENT_NODE) && ue.NoModificationAllowedError();
        break;
      case "afterbegin":
      case "beforeend":
        n = this;
        break;
      default:
        ue.SyntaxError();
    }
    (!(n instanceof Tt) || n.ownerDocument.isHTML && n.localName === "html" && n.namespaceURI === tt.HTML) && (n = n.ownerDocument.createElementNS(tt.HTML, "body"));
    var l = this.ownerDocument.implementation.mozHTMLParser(this.ownerDocument._address, n);
    l.parse(r, true), this._insertAdjacent(t, l._asDocumentFragment());
  } }, children: { get: function() {
    return this._children || (this._children = new Ns(this)), this._children;
  } }, attributes: { get: function() {
    return this._attributes || (this._attributes = new Ca(this)), this._attributes;
  } }, isConnected: { get: function() {
    let e2 = this;
    for (; e2 != null; ) {
      if (e2.nodeType === Ie.DOCUMENT_NODE)
        return true;
      e2 = e2.parentNode, e2 != null && e2.nodeType === Ie.DOCUMENT_FRAGMENT_NODE && (e2 = e2.host);
    }
    return false;
  } }, firstElementChild: { get: function() {
    for (var e2 = this.firstChild; e2 !== null; e2 = e2.nextSibling)
      if (e2.nodeType === Ie.ELEMENT_NODE)
        return e2;
    return null;
  } }, lastElementChild: { get: function() {
    for (var e2 = this.lastChild; e2 !== null; e2 = e2.previousSibling)
      if (e2.nodeType === Ie.ELEMENT_NODE)
        return e2;
    return null;
  } }, childElementCount: { get: function() {
    return this.children.length;
  } }, nextElement: { value: function(e2) {
    e2 || (e2 = this.ownerDocument.documentElement);
    var t = this.firstElementChild;
    if (!t) {
      if (this === e2)
        return null;
      t = this.nextElementSibling;
    }
    if (t)
      return t;
    for (var r = this.parentElement; r && r !== e2; r = r.parentElement)
      if (t = r.nextElementSibling, t)
        return t;
    return null;
  } }, getElementsByTagName: { value: function(t) {
    var r;
    return t ? (t === "*" ? r = function() {
      return true;
    } : this.isHTML ? r = Pu(t) : r = Na(t), new cn(this, r)) : new ka();
  } }, getElementsByTagNameNS: { value: function(t, r) {
    var n;
    return t === "*" && r === "*" ? n = function() {
      return true;
    } : t === "*" ? n = Na(r) : r === "*" ? n = Bu(t) : n = Uu(t, r), new cn(this, n);
  } }, getElementsByClassName: { value: function(t) {
    if (t = String(t).trim(), t === "") {
      var r = new ka();
      return r;
    }
    return t = t.split(/[ \t\r\n\f]+/), new cn(this, Vu(t));
  } }, getElementsByName: { value: function(t) {
    return new cn(this, zu(String(t)));
  } }, clone: { value: function() {
    var t;
    this.namespaceURI !== tt.HTML || this.prefix || !this.ownerDocument.isHTML ? t = this.ownerDocument.createElementNS(this.namespaceURI, this.prefix !== null ? this.prefix + ":" + this.localName : this.localName) : t = this.ownerDocument.createElement(this.localName);
    for (var r = 0, n = this._attrKeys.length; r < n; r++) {
      var l = this._attrKeys[r], f2 = this._attrsByLName[l], _ = f2.cloneNode();
      _._setOwnerElement(t), t._attrsByLName[l] = _, t._addQName(_);
    }
    return t._attrKeys = this._attrKeys.concat(), t;
  } }, isEqual: { value: function(t) {
    if (this.localName !== t.localName || this.namespaceURI !== t.namespaceURI || this.prefix !== t.prefix || this._numattrs !== t._numattrs)
      return false;
    for (var r = 0, n = this._numattrs; r < n; r++) {
      var l = this._attr(r);
      if (!t.hasAttributeNS(l.namespaceURI, l.localName) || t.getAttributeNS(l.namespaceURI, l.localName) !== l.value)
        return false;
    }
    return true;
  } }, _lookupNamespacePrefix: { value: function(t, r) {
    if (this.namespaceURI && this.namespaceURI === t && this.prefix !== null && r.lookupNamespaceURI(this.prefix) === t)
      return this.prefix;
    for (var n = 0, l = this._numattrs; n < l; n++) {
      var f2 = this._attr(n);
      if (f2.prefix === "xmlns" && f2.value === t && r.lookupNamespaceURI(f2.localName) === t)
        return f2.localName;
    }
    var _ = this.parentElement;
    return _ ? _._lookupNamespacePrefix(t, r) : null;
  } }, lookupNamespaceURI: { value: function(t) {
    if ((t === "" || t === void 0) && (t = null), this.namespaceURI !== null && this.prefix === t)
      return this.namespaceURI;
    for (var r = 0, n = this._numattrs; r < n; r++) {
      var l = this._attr(r);
      if (l.namespaceURI === tt.XMLNS && (l.prefix === "xmlns" && l.localName === t || t === null && l.prefix === null && l.localName === "xmlns"))
        return l.value || null;
    }
    var f2 = this.parentElement;
    return f2 ? f2.lookupNamespaceURI(t) : null;
  } }, getAttribute: { value: function(t) {
    var r = this.getAttributeNode(t);
    return r ? r.value : null;
  } }, getAttributeNS: { value: function(t, r) {
    var n = this.getAttributeNodeNS(t, r);
    return n ? n.value : null;
  } }, getAttributeNode: { value: function(t) {
    t = String(t), /[A-Z]/.test(t) && this.isHTML && (t = ue.toASCIILowerCase(t));
    var r = this._attrsByQName[t];
    return r ? (Array.isArray(r) && (r = r[0]), r) : null;
  } }, getAttributeNodeNS: { value: function(t, r) {
    t = t == null ? "" : String(t), r = String(r);
    var n = this._attrsByLName[t + "|" + r];
    return n || null;
  } }, hasAttribute: { value: function(t) {
    return t = String(t), /[A-Z]/.test(t) && this.isHTML && (t = ue.toASCIILowerCase(t)), this._attrsByQName[t] !== void 0;
  } }, hasAttributeNS: { value: function(t, r) {
    t = t == null ? "" : String(t), r = String(r);
    var n = t + "|" + r;
    return this._attrsByLName[n] !== void 0;
  } }, hasAttributes: { value: function() {
    return this._numattrs > 0;
  } }, toggleAttribute: { value: function(t, r) {
    t = String(t), wa.isValidName(t) || ue.InvalidCharacterError(), /[A-Z]/.test(t) && this.isHTML && (t = ue.toASCIILowerCase(t));
    var n = this._attrsByQName[t];
    return n === void 0 ? r === void 0 || r === true ? (this._setAttribute(t, ""), true) : false : r === void 0 || r === false ? (this.removeAttribute(t), false) : true;
  } }, _setAttribute: { value: function(t, r) {
    var n = this._attrsByQName[t], l;
    n ? Array.isArray(n) && (n = n[0]) : (n = this._newattr(t), l = true), n.value = r, this._attributes && (this._attributes[t] = n), l && this._newattrhook && this._newattrhook(t, r);
  } }, setAttribute: { value: function(t, r) {
    t = String(t), wa.isValidName(t) || ue.InvalidCharacterError(), /[A-Z]/.test(t) && this.isHTML && (t = ue.toASCIILowerCase(t)), this._setAttribute(t, String(r));
  } }, _setAttributeNS: { value: function(t, r, n) {
    var l = r.indexOf(":"), f2, _;
    l < 0 ? (f2 = null, _ = r) : (f2 = r.substring(0, l), _ = r.substring(l + 1)), (t === "" || t === void 0) && (t = null);
    var y = (t === null ? "" : t) + "|" + _, w = this._attrsByLName[y], S;
    w || (w = new br(this, _, f2, t), S = true, this._attrsByLName[y] = w, this._attributes && (this._attributes[this._attrKeys.length] = w), this._attrKeys.push(y), this._addQName(w)), w.value = n, S && this._newattrhook && this._newattrhook(r, n);
  } }, setAttributeNS: { value: function(t, r, n) {
    t = t == null || t === "" ? null : String(t), r = String(r), wa.isValidQName(r) || ue.InvalidCharacterError();
    var l = r.indexOf(":"), f2 = l < 0 ? null : r.substring(0, l);
    (f2 !== null && t === null || f2 === "xml" && t !== tt.XML || (r === "xmlns" || f2 === "xmlns") && t !== tt.XMLNS || t === tt.XMLNS && !(r === "xmlns" || f2 === "xmlns")) && ue.NamespaceError(), this._setAttributeNS(t, r, String(n));
  } }, setAttributeNode: { value: function(t) {
    if (t.ownerElement !== null && t.ownerElement !== this)
      throw new $t($t.INUSE_ATTRIBUTE_ERR);
    var r = null, n = this._attrsByQName[t.name];
    if (n) {
      if (Array.isArray(n) || (n = [n]), n.some(function(l) {
        return l === t;
      }))
        return t;
      if (t.ownerElement !== null)
        throw new $t($t.INUSE_ATTRIBUTE_ERR);
      n.forEach(function(l) {
        this.removeAttributeNode(l);
      }, this), r = n[0];
    }
    return this.setAttributeNodeNS(t), r;
  } }, setAttributeNodeNS: { value: function(t) {
    if (t.ownerElement !== null)
      throw new $t($t.INUSE_ATTRIBUTE_ERR);
    var r = t.namespaceURI, n = (r === null ? "" : r) + "|" + t.localName, l = this._attrsByLName[n];
    return l && this.removeAttributeNode(l), t._setOwnerElement(this), this._attrsByLName[n] = t, this._attributes && (this._attributes[this._attrKeys.length] = t), this._attrKeys.push(n), this._addQName(t), this._newattrhook && this._newattrhook(t.name, t.value), l || null;
  } }, removeAttribute: { value: function(t) {
    t = String(t), /[A-Z]/.test(t) && this.isHTML && (t = ue.toASCIILowerCase(t));
    var r = this._attrsByQName[t];
    if (!!r) {
      Array.isArray(r) ? r.length > 2 ? r = r.shift() : (this._attrsByQName[t] = r[1], r = r[0]) : this._attrsByQName[t] = void 0;
      var n = r.namespaceURI, l = (n === null ? "" : n) + "|" + r.localName;
      this._attrsByLName[l] = void 0;
      var f2 = this._attrKeys.indexOf(l);
      this._attributes && (Array.prototype.splice.call(this._attributes, f2, 1), this._attributes[t] = void 0), this._attrKeys.splice(f2, 1);
      var _ = r.onchange;
      r._setOwnerElement(null), _ && _.call(r, this, r.localName, r.value, null), this.rooted && this.ownerDocument.mutateRemoveAttr(r);
    }
  } }, removeAttributeNS: { value: function(t, r) {
    t = t == null ? "" : String(t), r = String(r);
    var n = t + "|" + r, l = this._attrsByLName[n];
    if (!!l) {
      this._attrsByLName[n] = void 0;
      var f2 = this._attrKeys.indexOf(n);
      this._attributes && Array.prototype.splice.call(this._attributes, f2, 1), this._attrKeys.splice(f2, 1), this._removeQName(l);
      var _ = l.onchange;
      l._setOwnerElement(null), _ && _.call(l, this, l.localName, l.value, null), this.rooted && this.ownerDocument.mutateRemoveAttr(l);
    }
  } }, removeAttributeNode: { value: function(t) {
    var r = t.namespaceURI, n = (r === null ? "" : r) + "|" + t.localName;
    return this._attrsByLName[n] !== t && ue.NotFoundError(), this.removeAttributeNS(r, t.localName), t;
  } }, getAttributeNames: { value: function() {
    var t = this;
    return this._attrKeys.map(function(r) {
      return t._attrsByLName[r].name;
    });
  } }, _getattr: { value: function(t) {
    var r = this._attrsByQName[t];
    return r ? r.value : null;
  } }, _setattr: { value: function(t, r) {
    var n = this._attrsByQName[t], l;
    n || (n = this._newattr(t), l = true), n.value = String(r), this._attributes && (this._attributes[t] = n), l && this._newattrhook && this._newattrhook(t, r);
  } }, _newattr: { value: function(t) {
    var r = new br(this, t, null, null), n = "|" + t;
    return this._attrsByQName[t] = r, this._attrsByLName[n] = r, this._attributes && (this._attributes[this._attrKeys.length] = r), this._attrKeys.push(n), r;
  } }, _addQName: { value: function(e2) {
    var t = e2.name, r = this._attrsByQName[t];
    r ? Array.isArray(r) ? r.push(e2) : this._attrsByQName[t] = [r, e2] : this._attrsByQName[t] = e2, this._attributes && (this._attributes[t] = e2);
  } }, _removeQName: { value: function(e2) {
    var t = e2.name, r = this._attrsByQName[t];
    if (Array.isArray(r)) {
      var n = r.indexOf(e2);
      ue.assert(n !== -1), r.length === 2 ? (this._attrsByQName[t] = r[1 - n], this._attributes && (this._attributes[t] = this._attrsByQName[t])) : (r.splice(n, 1), this._attributes && this._attributes[t] === e2 && (this._attributes[t] = r[0]));
    } else
      ue.assert(r === e2), this._attrsByQName[t] = void 0, this._attributes && (this._attributes[t] = void 0);
  } }, _numattrs: { get: function() {
    return this._attrKeys.length;
  } }, _attr: { value: function(e2) {
    return this._attrsByLName[this._attrKeys[e2]];
  } }, id: ln.property({ name: "id" }), className: ln.property({ name: "class" }), classList: { get: function() {
    var e2 = this;
    if (this._classList)
      return this._classList;
    var t = new qu(function() {
      return e2.className || "";
    }, function(r) {
      e2.className = r;
    });
    return this._classList = t, t;
  }, set: function(e2) {
    this.className = e2;
  } }, matches: { value: function(e2) {
    return Sa.matches(this, e2);
  } }, closest: { value: function(e2) {
    var t = this;
    do {
      if (t.matches && t.matches(e2))
        return t;
      t = t.parentElement || t.parentNode;
    } while (t !== null && t.nodeType === Ie.ELEMENT_NODE);
    return null;
  } }, querySelector: { value: function(e2) {
    return Sa(e2, this)[0];
  } }, querySelectorAll: { value: function(e2) {
    var t = Sa(e2, this);
    return t.item ? t : new ka(t);
  } } });
  Object.defineProperties(Tt.prototype, Hu);
  Object.defineProperties(Tt.prototype, Fu);
  ln.registerChangeHandler(Tt, "id", function(e2, t, r, n) {
    e2.rooted && (r && e2.ownerDocument.delId(r, e2), n && e2.ownerDocument.addId(n, e2));
  });
  ln.registerChangeHandler(Tt, "class", function(e2, t, r, n) {
    e2._classList && e2._classList._update();
  });
  function br(e2, t, r, n, l) {
    this.localName = t, this.prefix = r === null || r === "" ? null : "" + r, this.namespaceURI = n === null || n === "" ? null : "" + n, this.data = l, this._setOwnerElement(e2);
  }
  br.prototype = Object.create(Object.prototype, { ownerElement: { get: function() {
    return this._ownerElement;
  } }, _setOwnerElement: { value: function(t) {
    this._ownerElement = t, this.prefix === null && this.namespaceURI === null && t ? this.onchange = t._attributeChangeHandlers[this.localName] : this.onchange = null;
  } }, name: { get: function() {
    return this.prefix ? this.prefix + ":" + this.localName : this.localName;
  } }, specified: { get: function() {
    return true;
  } }, value: { get: function() {
    return this.data;
  }, set: function(e2) {
    var t = this.data;
    e2 = e2 === void 0 ? "" : e2 + "", e2 !== t && (this.data = e2, this.ownerElement && (this.onchange && this.onchange(this.ownerElement, this.localName, t, e2), this.ownerElement.rooted && this.ownerElement.ownerDocument.mutateAttr(this, t)));
  } }, cloneNode: { value: function(t) {
    return new br(null, this.localName, this.prefix, this.namespaceURI, this.data);
  } }, nodeType: { get: function() {
    return Ie.ATTRIBUTE_NODE;
  } }, nodeName: { get: function() {
    return this.name;
  } }, nodeValue: { get: function() {
    return this.value;
  }, set: function(e2) {
    this.value = e2;
  } }, textContent: { get: function() {
    return this.value;
  }, set: function(e2) {
    e2 == null && (e2 = ""), this.value = e2;
  } } });
  Tt._Attr = br;
  function Ca(e2) {
    ks.call(this, e2);
    for (var t in e2._attrsByQName)
      this[t] = e2._attrsByQName[t];
    for (var r = 0; r < e2._attrKeys.length; r++)
      this[r] = e2._attrsByLName[e2._attrKeys[r]];
  }
  Ca.prototype = Object.create(ks.prototype, { length: { get: function() {
    return this.element._attrKeys.length;
  }, set: function() {
  } }, item: { value: function(e2) {
    return e2 = e2 >>> 0, e2 >= this.length ? null : this.element._attrsByLName[this.element._attrKeys[e2]];
  } } });
  global.Symbol && global.Symbol.iterator && (Ca.prototype[global.Symbol.iterator] = function() {
    var e2 = 0, t = this.length, r = this;
    return { next: function() {
      return e2 < t ? { value: r.item(e2++) } : { done: true };
    } };
  });
  function Ns(e2) {
    this.element = e2, this.updateCache();
  }
  Ns.prototype = Object.create(Object.prototype, { length: { get: function() {
    return this.updateCache(), this.childrenByNumber.length;
  } }, item: { value: function(t) {
    return this.updateCache(), this.childrenByNumber[t] || null;
  } }, namedItem: { value: function(t) {
    return this.updateCache(), this.childrenByName[t] || null;
  } }, namedItems: { get: function() {
    return this.updateCache(), this.childrenByName;
  } }, updateCache: { value: function() {
    var t = /^(a|applet|area|embed|form|frame|frameset|iframe|img|object)$/;
    if (this.lastModTime !== this.element.lastModTime) {
      this.lastModTime = this.element.lastModTime;
      for (var r = this.childrenByNumber && this.childrenByNumber.length || 0, n = 0; n < r; n++)
        this[n] = void 0;
      this.childrenByNumber = [], this.childrenByName = /* @__PURE__ */ Object.create(null);
      for (var l = this.element.firstChild; l !== null; l = l.nextSibling)
        if (l.nodeType === Ie.ELEMENT_NODE) {
          this[this.childrenByNumber.length] = l, this.childrenByNumber.push(l);
          var f2 = l.getAttribute("id");
          f2 && !this.childrenByName[f2] && (this.childrenByName[f2] = l);
          var _ = l.getAttribute("name");
          _ && this.element.namespaceURI === tt.HTML && t.test(this.element.localName) && !this.childrenByName[_] && (this.childrenByName[f2] = l);
        }
    }
  } } });
  function Na(e2) {
    return function(t) {
      return t.localName === e2;
    };
  }
  function Pu(e2) {
    var t = ue.toASCIILowerCase(e2);
    return t === e2 ? Na(e2) : function(r) {
      return r.isHTML ? r.localName === t : r.localName === e2;
    };
  }
  function Bu(e2) {
    return function(t) {
      return t.namespaceURI === e2;
    };
  }
  function Uu(e2, t) {
    return function(r) {
      return r.namespaceURI === e2 && r.localName === t;
    };
  }
  function Vu(e2) {
    return function(t) {
      return e2.every(function(r) {
        return t.classList.contains(r);
      });
    };
  }
  function zu(e2) {
    return function(t) {
      return t.namespaceURI !== tt.HTML ? false : t.getAttribute("name") === e2;
    };
  }
});
var Aa = O((Hf, Rs) => {
  Rs.exports = Ms;
  var Ls = Te(), ju = It(), Ds = he(), As = Ds.HierarchyRequestError, Gu = Ds.NotFoundError;
  function Ms() {
    Ls.call(this);
  }
  Ms.prototype = Object.create(Ls.prototype, { hasChildNodes: { value: function() {
    return false;
  } }, firstChild: { value: null }, lastChild: { value: null }, insertBefore: { value: function(e2, t) {
    if (!e2.nodeType)
      throw new TypeError("not a node");
    As();
  } }, replaceChild: { value: function(e2, t) {
    if (!e2.nodeType)
      throw new TypeError("not a node");
    As();
  } }, removeChild: { value: function(e2) {
    if (!e2.nodeType)
      throw new TypeError("not a node");
    Gu();
  } }, removeChildren: { value: function() {
  } }, childNodes: { get: function() {
    return this._childNodes || (this._childNodes = new ju()), this._childNodes;
  } } });
});
var _r = O((Ff, qs) => {
  qs.exports = un;
  var Os = Aa(), Is = he(), Wu = on(), Yu = ya();
  function un() {
    Os.call(this);
  }
  un.prototype = Object.create(Os.prototype, { substringData: { value: function(t, r) {
    if (arguments.length < 2)
      throw new TypeError("Not enough arguments");
    return t = t >>> 0, r = r >>> 0, (t > this.data.length || t < 0 || r < 0) && Is.IndexSizeError(), this.data.substring(t, t + r);
  } }, appendData: { value: function(t) {
    if (arguments.length < 1)
      throw new TypeError("Not enough arguments");
    this.data += String(t);
  } }, insertData: { value: function(t, r) {
    return this.replaceData(t, 0, r);
  } }, deleteData: { value: function(t, r) {
    return this.replaceData(t, r, "");
  } }, replaceData: { value: function(t, r, n) {
    var l = this.data, f2 = l.length;
    t = t >>> 0, r = r >>> 0, n = String(n), (t > f2 || t < 0) && Is.IndexSizeError(), t + r > f2 && (r = f2 - t);
    var _ = l.substring(0, t), y = l.substring(t + r);
    this.data = _ + n + y;
  } }, isEqual: { value: function(t) {
    return this._data === t._data;
  } }, length: { get: function() {
    return this.data.length;
  } } });
  Object.defineProperties(un.prototype, Wu);
  Object.defineProperties(un.prototype, Yu);
});
var Da = O((Pf, Bs) => {
  Bs.exports = La;
  var Hs = he(), Fs = Te(), Ps = _r();
  function La(e2, t) {
    Ps.call(this), this.nodeType = Fs.TEXT_NODE, this.ownerDocument = e2, this._data = t, this._index = void 0;
  }
  var fn = { get: function() {
    return this._data;
  }, set: function(e2) {
    e2 == null ? e2 = "" : e2 = String(e2), e2 !== this._data && (this._data = e2, this.rooted && this.ownerDocument.mutateValue(this), this.parentNode && this.parentNode._textchangehook && this.parentNode._textchangehook(this));
  } };
  La.prototype = Object.create(Ps.prototype, { nodeName: { value: "#text" }, nodeValue: fn, textContent: fn, data: { get: fn.get, set: function(e2) {
    fn.set.call(this, e2 === null ? "" : String(e2));
  } }, splitText: { value: function(t) {
    (t > this._data.length || t < 0) && Hs.IndexSizeError();
    var r = this._data.substring(t), n = this.ownerDocument.createTextNode(r);
    this.data = this.data.substring(0, t);
    var l = this.parentNode;
    return l !== null && l.insertBefore(n, this.nextSibling), n;
  } }, wholeText: { get: function() {
    for (var t = this.textContent, r = this.nextSibling; r && r.nodeType === Fs.TEXT_NODE; r = r.nextSibling)
      t += r.textContent;
    return t;
  } }, replaceWholeText: { value: Hs.nyi }, clone: { value: function() {
    return new La(this.ownerDocument, this._data);
  } } });
});
var Ra = O((Bf, Vs) => {
  Vs.exports = Ma;
  var $u = Te(), Us = _r();
  function Ma(e2, t) {
    Us.call(this), this.nodeType = $u.COMMENT_NODE, this.ownerDocument = e2, this._data = t;
  }
  var dn = { get: function() {
    return this._data;
  }, set: function(e2) {
    e2 == null ? e2 = "" : e2 = String(e2), this._data = e2, this.rooted && this.ownerDocument.mutateValue(this);
  } };
  Ma.prototype = Object.create(Us.prototype, { nodeName: { value: "#comment" }, nodeValue: dn, textContent: dn, data: { get: dn.get, set: function(e2) {
    dn.set.call(this, e2 === null ? "" : String(e2));
  } }, clone: { value: function() {
    return new Ma(this.ownerDocument, this._data);
  } } });
});
var qa = O((Uf, Gs) => {
  Gs.exports = Oa;
  var Ku = Te(), Xu = It(), js = en(), Ia = Kt(), Qu = sn(), zs = he();
  function Oa(e2) {
    js.call(this), this.nodeType = Ku.DOCUMENT_FRAGMENT_NODE, this.ownerDocument = e2;
  }
  Oa.prototype = Object.create(js.prototype, { nodeName: { value: "#document-fragment" }, nodeValue: { get: function() {
    return null;
  }, set: function() {
  } }, textContent: Object.getOwnPropertyDescriptor(Ia.prototype, "textContent"), querySelector: { value: function(e2) {
    var t = this.querySelectorAll(e2);
    return t.length ? t[0] : null;
  } }, querySelectorAll: { value: function(e2) {
    var t = Object.create(this);
    t.isHTML = true, t.getElementsByTagName = Ia.prototype.getElementsByTagName, t.nextElement = Object.getOwnPropertyDescriptor(Ia.prototype, "firstElementChild").get;
    var r = Qu(e2, t);
    return r.item ? r : new Xu(r);
  } }, clone: { value: function() {
    return new Oa(this.ownerDocument);
  } }, isEqual: { value: function(t) {
    return true;
  } }, innerHTML: { get: function() {
    return this.serialize();
  }, set: zs.nyi }, outerHTML: { get: function() {
    return this.serialize();
  }, set: zs.nyi } });
});
var Fa = O((Vf, Ys) => {
  Ys.exports = Ha;
  var Zu = Te(), Ws = _r();
  function Ha(e2, t, r) {
    Ws.call(this), this.nodeType = Zu.PROCESSING_INSTRUCTION_NODE, this.ownerDocument = e2, this.target = t, this._data = r;
  }
  var hn = { get: function() {
    return this._data;
  }, set: function(e2) {
    e2 == null ? e2 = "" : e2 = String(e2), this._data = e2, this.rooted && this.ownerDocument.mutateValue(this);
  } };
  Ha.prototype = Object.create(Ws.prototype, { nodeName: { get: function() {
    return this.target;
  } }, nodeValue: hn, textContent: hn, data: { get: hn.get, set: function(e2) {
    hn.set.call(this, e2 === null ? "" : String(e2));
  } }, clone: { value: function() {
    return new Ha(this.ownerDocument, this.target, this._data);
  } }, isEqual: { value: function(t) {
    return this.target === t.target && this._data === t._data;
  } } });
});
var Er = O((zf, $s) => {
  var Pa = { FILTER_ACCEPT: 1, FILTER_REJECT: 2, FILTER_SKIP: 3, SHOW_ALL: 4294967295, SHOW_ELEMENT: 1, SHOW_ATTRIBUTE: 2, SHOW_TEXT: 4, SHOW_CDATA_SECTION: 8, SHOW_ENTITY_REFERENCE: 16, SHOW_ENTITY: 32, SHOW_PROCESSING_INSTRUCTION: 64, SHOW_COMMENT: 128, SHOW_DOCUMENT: 256, SHOW_DOCUMENT_TYPE: 512, SHOW_DOCUMENT_FRAGMENT: 1024, SHOW_NOTATION: 2048 };
  $s.exports = Pa.constructor = Pa.prototype = Pa;
});
var Ua = O((Gf, Xs) => {
  Xs.exports = { nextSkippingChildren: Ju, nextAncestorSibling: Ba, next: e0, previous: t0, deepLastChild: Ks };
  function Ju(e2, t) {
    return e2 === t ? null : e2.nextSibling !== null ? e2.nextSibling : Ba(e2, t);
  }
  function Ba(e2, t) {
    for (e2 = e2.parentNode; e2 !== null; e2 = e2.parentNode) {
      if (e2 === t)
        return null;
      if (e2.nextSibling !== null)
        return e2.nextSibling;
    }
    return null;
  }
  function e0(e2, t) {
    var r;
    return r = e2.firstChild, r !== null ? r : e2 === t ? null : (r = e2.nextSibling, r !== null ? r : Ba(e2, t));
  }
  function Ks(e2) {
    for (; e2.lastChild; )
      e2 = e2.lastChild;
    return e2;
  }
  function t0(e2, t) {
    var r;
    return r = e2.previousSibling, r !== null ? Ks(r) : (r = e2.parentNode, r === t ? null : r);
  }
});
var no = O((Wf, ro) => {
  ro.exports = to;
  var r0 = Te(), we = Er(), Qs = Ua(), eo = he(), Va = { first: "firstChild", last: "lastChild", next: "firstChild", previous: "lastChild" }, za = { first: "nextSibling", last: "previousSibling", next: "nextSibling", previous: "previousSibling" };
  function Zs(e2, t) {
    var r, n, l, f2, _;
    for (n = e2._currentNode[Va[t]]; n !== null; ) {
      if (f2 = e2._internalFilter(n), f2 === we.FILTER_ACCEPT)
        return e2._currentNode = n, n;
      if (f2 === we.FILTER_SKIP && (r = n[Va[t]], r !== null)) {
        n = r;
        continue;
      }
      for (; n !== null; ) {
        if (_ = n[za[t]], _ !== null) {
          n = _;
          break;
        }
        if (l = n.parentNode, l === null || l === e2.root || l === e2._currentNode)
          return null;
        n = l;
      }
    }
    return null;
  }
  function Js(e2, t) {
    var r, n, l;
    if (r = e2._currentNode, r === e2.root)
      return null;
    for (; ; ) {
      for (l = r[za[t]]; l !== null; ) {
        if (r = l, n = e2._internalFilter(r), n === we.FILTER_ACCEPT)
          return e2._currentNode = r, r;
        l = r[Va[t]], (n === we.FILTER_REJECT || l === null) && (l = r[za[t]]);
      }
      if (r = r.parentNode, r === null || r === e2.root || e2._internalFilter(r) === we.FILTER_ACCEPT)
        return null;
    }
  }
  function to(e2, t, r) {
    (!e2 || !e2.nodeType) && eo.NotSupportedError(), this._root = e2, this._whatToShow = Number(t) || 0, this._filter = r || null, this._active = false, this._currentNode = e2;
  }
  Object.defineProperties(to.prototype, { root: { get: function() {
    return this._root;
  } }, whatToShow: { get: function() {
    return this._whatToShow;
  } }, filter: { get: function() {
    return this._filter;
  } }, currentNode: { get: function() {
    return this._currentNode;
  }, set: function(t) {
    if (!(t instanceof r0))
      throw new TypeError("Not a Node");
    this._currentNode = t;
  } }, _internalFilter: { value: function(t) {
    var r, n;
    if (this._active && eo.InvalidStateError(), !(1 << t.nodeType - 1 & this._whatToShow))
      return we.FILTER_SKIP;
    if (n = this._filter, n === null)
      r = we.FILTER_ACCEPT;
    else {
      this._active = true;
      try {
        typeof n == "function" ? r = n(t) : r = n.acceptNode(t);
      } finally {
        this._active = false;
      }
    }
    return +r;
  } }, parentNode: { value: function() {
    for (var t = this._currentNode; t !== this.root; ) {
      if (t = t.parentNode, t === null)
        return null;
      if (this._internalFilter(t) === we.FILTER_ACCEPT)
        return this._currentNode = t, t;
    }
    return null;
  } }, firstChild: { value: function() {
    return Zs(this, "first");
  } }, lastChild: { value: function() {
    return Zs(this, "last");
  } }, previousSibling: { value: function() {
    return Js(this, "previous");
  } }, nextSibling: { value: function() {
    return Js(this, "next");
  } }, previousNode: { value: function() {
    var t, r, n, l;
    for (t = this._currentNode; t !== this._root; ) {
      for (n = t.previousSibling; n; n = t.previousSibling)
        if (t = n, r = this._internalFilter(t), r !== we.FILTER_REJECT) {
          for (l = t.lastChild; l && (t = l, r = this._internalFilter(t), r !== we.FILTER_REJECT); l = t.lastChild)
            ;
          if (r === we.FILTER_ACCEPT)
            return this._currentNode = t, t;
        }
      if (t === this.root || t.parentNode === null)
        return null;
      if (t = t.parentNode, this._internalFilter(t) === we.FILTER_ACCEPT)
        return this._currentNode = t, t;
    }
    return null;
  } }, nextNode: { value: function() {
    var t, r, n, l;
    t = this._currentNode, r = we.FILTER_ACCEPT;
    e:
      for (; ; ) {
        for (n = t.firstChild; n; n = t.firstChild) {
          if (t = n, r = this._internalFilter(t), r === we.FILTER_ACCEPT)
            return this._currentNode = t, t;
          if (r === we.FILTER_REJECT)
            break;
        }
        for (l = Qs.nextSkippingChildren(t, this.root); l; l = Qs.nextSkippingChildren(t, this.root)) {
          if (t = l, r = this._internalFilter(t), r === we.FILTER_ACCEPT)
            return this._currentNode = t, t;
          if (r === we.FILTER_SKIP)
            continue e;
        }
        return null;
      }
  } }, toString: { value: function() {
    return "[object TreeWalker]";
  } } });
});
var lo = O((Yf, co) => {
  co.exports = oo;
  var ja = Er(), Ga = Ua(), so = he();
  function n0(e2, t, r) {
    return r ? Ga.next(e2, t) : e2 === t ? null : Ga.previous(e2, null);
  }
  function ao(e2, t) {
    for (; t; t = t.parentNode)
      if (e2 === t)
        return true;
    return false;
  }
  function io(e2, t) {
    var r, n;
    for (r = e2._referenceNode, n = e2._pointerBeforeReferenceNode; ; ) {
      if (n === t)
        n = !n;
      else if (r = n0(r, e2._root, t), r === null)
        return null;
      var l = e2._internalFilter(r);
      if (l === ja.FILTER_ACCEPT)
        break;
    }
    return e2._referenceNode = r, e2._pointerBeforeReferenceNode = n, r;
  }
  function oo(e2, t, r) {
    (!e2 || !e2.nodeType) && so.NotSupportedError(), this._root = e2, this._referenceNode = e2, this._pointerBeforeReferenceNode = true, this._whatToShow = Number(t) || 0, this._filter = r || null, this._active = false, e2.doc._attachNodeIterator(this);
  }
  Object.defineProperties(oo.prototype, { root: { get: function() {
    return this._root;
  } }, referenceNode: { get: function() {
    return this._referenceNode;
  } }, pointerBeforeReferenceNode: { get: function() {
    return this._pointerBeforeReferenceNode;
  } }, whatToShow: { get: function() {
    return this._whatToShow;
  } }, filter: { get: function() {
    return this._filter;
  } }, _internalFilter: { value: function(t) {
    var r, n;
    if (this._active && so.InvalidStateError(), !(1 << t.nodeType - 1 & this._whatToShow))
      return ja.FILTER_SKIP;
    if (n = this._filter, n === null)
      r = ja.FILTER_ACCEPT;
    else {
      this._active = true;
      try {
        typeof n == "function" ? r = n(t) : r = n.acceptNode(t);
      } finally {
        this._active = false;
      }
    }
    return +r;
  } }, _preremove: { value: function(t) {
    if (!ao(t, this._root) && !!ao(t, this._referenceNode)) {
      if (this._pointerBeforeReferenceNode) {
        for (var r = t; r.lastChild; )
          r = r.lastChild;
        if (r = Ga.next(r, this.root), r) {
          this._referenceNode = r;
          return;
        }
        this._pointerBeforeReferenceNode = false;
      }
      if (t.previousSibling === null)
        this._referenceNode = t.parentNode;
      else {
        this._referenceNode = t.previousSibling;
        var n;
        for (n = this._referenceNode.lastChild; n; n = this._referenceNode.lastChild)
          this._referenceNode = n;
      }
    }
  } }, nextNode: { value: function() {
    return io(this, true);
  } }, previousNode: { value: function() {
    return io(this, false);
  } }, detach: { value: function() {
  } }, toString: { value: function() {
    return "[object NodeIterator]";
  } } });
});
var xn = O(($f, uo) => {
  uo.exports = ke;
  function ke(e2) {
    if (!e2)
      return Object.create(ke.prototype);
    this.url = e2.replace(/^[ \t\n\r\f]+|[ \t\n\r\f]+$/g, "");
    var t = ke.pattern.exec(this.url);
    if (t) {
      if (t[2] && (this.scheme = t[2]), t[4]) {
        var r = t[4].match(ke.userinfoPattern);
        if (r && (this.username = r[1], this.password = r[3], t[4] = t[4].substring(r[0].length)), t[4].match(ke.portPattern)) {
          var n = t[4].lastIndexOf(":");
          this.host = t[4].substring(0, n), this.port = t[4].substring(n + 1);
        } else
          this.host = t[4];
      }
      t[5] && (this.path = t[5]), t[6] && (this.query = t[7]), t[8] && (this.fragment = t[9]);
    }
  }
  ke.pattern = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;
  ke.userinfoPattern = /^([^@:]*)(:([^@]*))?@/;
  ke.portPattern = /:\d+$/;
  ke.authorityPattern = /^[^:\/?#]+:\/\//;
  ke.hierarchyPattern = /^[^:\/?#]+:\//;
  ke.percentEncode = function(t) {
    var r = t.charCodeAt(0);
    if (r < 256)
      return "%" + r.toString(16);
    throw Error("can't percent-encode codepoints > 255 yet");
  };
  ke.prototype = { constructor: ke, isAbsolute: function() {
    return !!this.scheme;
  }, isAuthorityBased: function() {
    return ke.authorityPattern.test(this.url);
  }, isHierarchical: function() {
    return ke.hierarchyPattern.test(this.url);
  }, toString: function() {
    var e2 = "";
    return this.scheme !== void 0 && (e2 += this.scheme + ":"), this.isAbsolute() && (e2 += "//", (this.username || this.password) && (e2 += this.username || "", this.password && (e2 += ":" + this.password), e2 += "@"), this.host && (e2 += this.host)), this.port !== void 0 && (e2 += ":" + this.port), this.path !== void 0 && (e2 += this.path), this.query !== void 0 && (e2 += "?" + this.query), this.fragment !== void 0 && (e2 += "#" + this.fragment), e2;
  }, resolve: function(e2) {
    var t = this, r = new ke(e2), n = new ke();
    return r.scheme !== void 0 ? (n.scheme = r.scheme, n.username = r.username, n.password = r.password, n.host = r.host, n.port = r.port, n.path = f2(r.path), n.query = r.query) : (n.scheme = t.scheme, r.host !== void 0 ? (n.username = r.username, n.password = r.password, n.host = r.host, n.port = r.port, n.path = f2(r.path), n.query = r.query) : (n.username = t.username, n.password = t.password, n.host = t.host, n.port = t.port, r.path ? (r.path.charAt(0) === "/" ? n.path = f2(r.path) : (n.path = l(t.path, r.path), n.path = f2(n.path)), n.query = r.query) : (n.path = t.path, r.query !== void 0 ? n.query = r.query : n.query = t.query))), n.fragment = r.fragment, n.toString();
    function l(_, y) {
      if (t.host !== void 0 && !t.path)
        return "/" + y;
      var w = _.lastIndexOf("/");
      return w === -1 ? y : _.substring(0, w + 1) + y;
    }
    function f2(_) {
      if (!_)
        return _;
      for (var y = ""; _.length > 0; ) {
        if (_ === "." || _ === "..") {
          _ = "";
          break;
        }
        var w = _.substring(0, 2), S = _.substring(0, 3), D = _.substring(0, 4);
        if (S === "../")
          _ = _.substring(3);
        else if (w === "./")
          _ = _.substring(2);
        else if (S === "/./")
          _ = "/" + _.substring(3);
        else if (w === "/." && _.length === 2)
          _ = "/";
        else if (D === "/../" || S === "/.." && _.length === 3)
          _ = "/" + _.substring(4), y = y.replace(/\/?[^\/]*$/, "");
        else {
          var ae = _.match(/(\/?([^\/]*))/)[0];
          y += ae, _ = _.substring(ae.length);
        }
      }
      return y;
    }
  } };
});
var xo = O((Kf, ho) => {
  ho.exports = Wa;
  var fo = Vt();
  function Wa(e2, t) {
    fo.call(this, e2, t);
  }
  Wa.prototype = Object.create(fo.prototype, { constructor: { value: Wa } });
});
var Ya = O((Xf, po) => {
  po.exports = { Event: Vt(), UIEvent: Kn(), MouseEvent: Qn(), CustomEvent: xo() };
});
var go = O((mo) => {
  var ct = /* @__PURE__ */ Object.create(null);
  (function() {
    function e2() {
      this._listeners = /* @__PURE__ */ Object.create(null);
    }
    e2.prototype = { constructor: e2, addListener: function(f2, _) {
      this._listeners[f2] || (this._listeners[f2] = []), this._listeners[f2].push(_);
    }, fire: function(f2) {
      if (typeof f2 == "string" && (f2 = { type: f2 }), typeof f2.target != "undefined" && (f2.target = this), typeof f2.type == "undefined")
        throw new Error("Event object missing 'type' property.");
      if (this._listeners[f2.type])
        for (var _ = this._listeners[f2.type].concat(), y = 0, w = _.length; y < w; y++)
          _[y].call(this, f2);
    }, removeListener: function(f2, _) {
      if (this._listeners[f2]) {
        for (var y = this._listeners[f2], w = 0, S = y.length; w < S; w++)
          if (y[w] === _) {
            y.splice(w, 1);
            break;
          }
      }
    } };
    function t(f2) {
      this._input = f2.replace(/(\r|\n){1,2}/g, `
`), this._line = 1, this._col = 1, this._cursor = 0;
    }
    t.prototype = { constructor: t, getCol: function() {
      return this._col;
    }, getLine: function() {
      return this._line;
    }, eof: function() {
      return this._cursor === this._input.length;
    }, peek: function(f2) {
      var _ = null;
      return f2 = typeof f2 == "undefined" ? 1 : f2, this._cursor < this._input.length && (_ = this._input.charAt(this._cursor + f2 - 1)), _;
    }, read: function() {
      var f2 = null;
      return this._cursor < this._input.length && (this._input.charAt(this._cursor) === `
` ? (this._line++, this._col = 1) : this._col++, f2 = this._input.charAt(this._cursor++)), f2;
    }, mark: function() {
      this._bookmark = { cursor: this._cursor, line: this._line, col: this._col };
    }, reset: function() {
      this._bookmark && (this._cursor = this._bookmark.cursor, this._line = this._bookmark.line, this._col = this._bookmark.col, delete this._bookmark);
    }, readTo: function(f2) {
      for (var _ = "", y; _.length < f2.length || _.lastIndexOf(f2) !== _.length - f2.length; )
        if (y = this.read(), y)
          _ += y;
        else
          throw new Error('Expected "' + f2 + '" at line ' + this._line + ", col " + this._col + ".");
      return _;
    }, readWhile: function(f2) {
      for (var _ = "", y = this.read(); y !== null && f2(y); )
        _ += y, y = this.read();
      return _;
    }, readMatch: function(f2) {
      var _ = this._input.substring(this._cursor), y = null;
      return typeof f2 == "string" ? _.indexOf(f2) === 0 && (y = this.readCount(f2.length)) : f2 instanceof RegExp && f2.test(_) && (y = this.readCount(RegExp.lastMatch.length)), y;
    }, readCount: function(f2) {
      for (var _ = ""; f2--; )
        _ += this.read();
      return _;
    } };
    function r(f2, _, y) {
      Error.call(this), this.name = this.constructor.name, this.col = y, this.line = _, this.message = f2;
    }
    r.prototype = Object.create(Error.prototype), r.prototype.constructor = r;
    function n(f2, _, y, w) {
      this.col = y, this.line = _, this.text = f2, this.type = w;
    }
    n.fromToken = function(f2) {
      return new n(f2.value, f2.startLine, f2.startCol);
    }, n.prototype = { constructor: n, valueOf: function() {
      return this.toString();
    }, toString: function() {
      return this.text;
    } };
    function l(f2, _) {
      this._reader = f2 ? new t(f2.toString()) : null, this._token = null, this._tokenData = _, this._lt = [], this._ltIndex = 0, this._ltIndexCache = [];
    }
    l.createTokenData = function(f2) {
      var _ = [], y = /* @__PURE__ */ Object.create(null), w = f2.concat([]), S = 0, D = w.length + 1;
      for (w.UNKNOWN = -1, w.unshift({ name: "EOF" }); S < D; S++)
        _.push(w[S].name), w[w[S].name] = S, w[S].text && (y[w[S].text] = S);
      return w.name = function(ae) {
        return _[ae];
      }, w.type = function(ae) {
        return y[ae];
      }, w;
    }, l.prototype = { constructor: l, match: function(f2, _) {
      f2 instanceof Array || (f2 = [f2]);
      for (var y = this.get(_), w = 0, S = f2.length; w < S; )
        if (y === f2[w++])
          return true;
      return this.unget(), false;
    }, mustMatch: function(f2, _) {
      var y;
      if (f2 instanceof Array || (f2 = [f2]), !this.match.apply(this, arguments))
        throw y = this.LT(1), new r("Expected " + this._tokenData[f2[0]].name + " at line " + y.startLine + ", col " + y.startCol + ".", y.startLine, y.startCol);
    }, advance: function(f2, _) {
      for (; this.LA(0) !== 0 && !this.match(f2, _); )
        this.get();
      return this.LA(0);
    }, get: function(f2) {
      var _ = this._tokenData, y = 0, w, S;
      if (this._lt.length && this._ltIndex >= 0 && this._ltIndex < this._lt.length) {
        for (y++, this._token = this._lt[this._ltIndex++], S = _[this._token.type]; S.channel !== void 0 && f2 !== S.channel && this._ltIndex < this._lt.length; )
          this._token = this._lt[this._ltIndex++], S = _[this._token.type], y++;
        if ((S.channel === void 0 || f2 === S.channel) && this._ltIndex <= this._lt.length)
          return this._ltIndexCache.push(y), this._token.type;
      }
      return w = this._getToken(), w.type > -1 && !_[w.type].hide && (w.channel = _[w.type].channel, this._token = w, this._lt.push(w), this._ltIndexCache.push(this._lt.length - this._ltIndex + y), this._lt.length > 5 && this._lt.shift(), this._ltIndexCache.length > 5 && this._ltIndexCache.shift(), this._ltIndex = this._lt.length), S = _[w.type], S && (S.hide || S.channel !== void 0 && f2 !== S.channel) ? this.get(f2) : w.type;
    }, LA: function(f2) {
      var _ = f2, y;
      if (f2 > 0) {
        if (f2 > 5)
          throw new Error("Too much lookahead.");
        for (; _; )
          y = this.get(), _--;
        for (; _ < f2; )
          this.unget(), _++;
      } else if (f2 < 0)
        if (this._lt[this._ltIndex + f2])
          y = this._lt[this._ltIndex + f2].type;
        else
          throw new Error("Too much lookbehind.");
      else
        y = this._token.type;
      return y;
    }, LT: function(f2) {
      return this.LA(f2), this._lt[this._ltIndex + f2 - 1];
    }, peek: function() {
      return this.LA(1);
    }, token: function() {
      return this._token;
    }, tokenName: function(f2) {
      return f2 < 0 || f2 > this._tokenData.length ? "UNKNOWN_TOKEN" : this._tokenData[f2].name;
    }, tokenType: function(f2) {
      return this._tokenData[f2] || -1;
    }, unget: function() {
      if (this._ltIndexCache.length)
        this._ltIndex -= this._ltIndexCache.pop(), this._token = this._lt[this._ltIndex - 1];
      else
        throw new Error("Too much lookahead.");
    } }, ct.util = { __proto__: null, StringReader: t, SyntaxError: r, SyntaxUnit: n, EventTarget: e2, TokenStreamBase: l };
  })();
  (function() {
    var e2 = ct.util.EventTarget, t = ct.util.TokenStreamBase;
    ct.util.StringReader;
    var n = ct.util.SyntaxError, l = ct.util.SyntaxUnit, f2 = { __proto__: null, aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff", aquamarine: "#7fffd4", azure: "#f0ffff", beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000000", blanchedalmond: "#ffebcd", blue: "#0000ff", blueviolet: "#8a2be2", brown: "#a52a2a", burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00", chocolate: "#d2691e", coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c", cyan: "#00ffff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b", darkgray: "#a9a9a9", darkgrey: "#a9a9a9", darkgreen: "#006400", darkkhaki: "#bdb76b", darkmagenta: "#8b008b", darkolivegreen: "#556b2f", darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000", darksalmon: "#e9967a", darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f", darkslategrey: "#2f4f4f", darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493", deepskyblue: "#00bfff", dimgray: "#696969", dimgrey: "#696969", dodgerblue: "#1e90ff", firebrick: "#b22222", floralwhite: "#fffaf0", forestgreen: "#228b22", fuchsia: "#ff00ff", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff", gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", grey: "#808080", green: "#008000", greenyellow: "#adff2f", honeydew: "#f0fff0", hotpink: "#ff69b4", indianred: "#cd5c5c", indigo: "#4b0082", ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa", lavenderblush: "#fff0f5", lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6", lightcoral: "#f08080", lightcyan: "#e0ffff", lightgoldenrodyellow: "#fafad2", lightgray: "#d3d3d3", lightgrey: "#d3d3d3", lightgreen: "#90ee90", lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa", lightskyblue: "#87cefa", lightslategray: "#778899", lightslategrey: "#778899", lightsteelblue: "#b0c4de", lightyellow: "#ffffe0", lime: "#00ff00", limegreen: "#32cd32", linen: "#faf0e6", magenta: "#ff00ff", maroon: "#800000", mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3", mediumpurple: "#9370d8", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a", mediumturquoise: "#48d1cc", mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa", mistyrose: "#ffe4e1", moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080", oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23", orange: "#ffa500", orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98", paleturquoise: "#afeeee", palevioletred: "#d87093", papayawhip: "#ffefd5", peachpuff: "#ffdab9", peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6", purple: "#800080", red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1", saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460", seagreen: "#2e8b57", seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0", skyblue: "#87ceeb", slateblue: "#6a5acd", slategray: "#708090", slategrey: "#708090", snow: "#fffafa", springgreen: "#00ff7f", steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8", tomato: "#ff6347", turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3", white: "#ffffff", whitesmoke: "#f5f5f5", yellow: "#ffff00", yellowgreen: "#9acd32", currentColor: "The value of the 'color' property.", activeBorder: "Active window border.", activecaption: "Active window caption.", appworkspace: "Background color of multiple document interface.", background: "Desktop background.", buttonface: "The face background color for 3-D elements that appear 3-D due to one layer of surrounding border.", buttonhighlight: "The color of the border facing the light source for 3-D elements that appear 3-D due to one layer of surrounding border.", buttonshadow: "The color of the border away from the light source for 3-D elements that appear 3-D due to one layer of surrounding border.", buttontext: "Text on push buttons.", captiontext: "Text in caption, size box, and scrollbar arrow box.", graytext: "Grayed (disabled) text. This color is set to #000 if the current display driver does not support a solid gray color.", greytext: "Greyed (disabled) text. This color is set to #000 if the current display driver does not support a solid grey color.", highlight: "Item(s) selected in a control.", highlighttext: "Text of item(s) selected in a control.", inactiveborder: "Inactive window border.", inactivecaption: "Inactive window caption.", inactivecaptiontext: "Color of text in an inactive caption.", infobackground: "Background color for tooltip controls.", infotext: "Text color for tooltip controls.", menu: "Menu background.", menutext: "Text in menus.", scrollbar: "Scroll bar gray area.", threeddarkshadow: "The color of the darker (generally outer) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.", threedface: "The face background color for 3-D elements that appear 3-D due to two concentric layers of surrounding border.", threedhighlight: "The color of the lighter (generally outer) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.", threedlightshadow: "The color of the darker (generally inner) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.", threedshadow: "The color of the lighter (generally inner) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.", window: "Window background.", windowframe: "Window frame.", windowtext: "Text in windows." };
    function _(c2, h2, m) {
      l.call(this, c2, h2, m, S.COMBINATOR_TYPE), this.type = "unknown", /^\s+$/.test(c2) ? this.type = "descendant" : c2 === ">" ? this.type = "child" : c2 === "+" ? this.type = "adjacent-sibling" : c2 === "~" && (this.type = "sibling");
    }
    _.prototype = new l(), _.prototype.constructor = _;
    function y(c2, h2) {
      l.call(this, "(" + c2 + (h2 !== null ? ":" + h2 : "") + ")", c2.startLine, c2.startCol, S.MEDIA_FEATURE_TYPE), this.name = c2, this.value = h2;
    }
    y.prototype = new l(), y.prototype.constructor = y;
    function w(c2, h2, m, a, o) {
      l.call(this, (c2 ? c2 + " " : "") + (h2 || "") + (h2 && m.length > 0 ? " and " : "") + m.join(" and "), a, o, S.MEDIA_QUERY_TYPE), this.modifier = c2, this.mediaType = h2, this.features = m;
    }
    w.prototype = new l(), w.prototype.constructor = w;
    function S(c2) {
      e2.call(this), this.options = c2 || {}, this._tokenStream = null;
    }
    S.DEFAULT_TYPE = 0, S.COMBINATOR_TYPE = 1, S.MEDIA_FEATURE_TYPE = 2, S.MEDIA_QUERY_TYPE = 3, S.PROPERTY_NAME_TYPE = 4, S.PROPERTY_VALUE_TYPE = 5, S.PROPERTY_VALUE_PART_TYPE = 6, S.SELECTOR_TYPE = 7, S.SELECTOR_PART_TYPE = 8, S.SELECTOR_SUB_PART_TYPE = 9, S.prototype = function() {
      var c2 = new e2(), h2, m = { __proto__: null, constructor: S, DEFAULT_TYPE: 0, COMBINATOR_TYPE: 1, MEDIA_FEATURE_TYPE: 2, MEDIA_QUERY_TYPE: 3, PROPERTY_NAME_TYPE: 4, PROPERTY_VALUE_TYPE: 5, PROPERTY_VALUE_PART_TYPE: 6, SELECTOR_TYPE: 7, SELECTOR_PART_TYPE: 8, SELECTOR_SUB_PART_TYPE: 9, _stylesheet: function() {
        var a = this._tokenStream, o, u, b2;
        for (this.fire("startstylesheet"), this._charset(), this._skipCruft(); a.peek() === d2.IMPORT_SYM; )
          this._import(), this._skipCruft();
        for (; a.peek() === d2.NAMESPACE_SYM; )
          this._namespace(), this._skipCruft();
        for (b2 = a.peek(); b2 > d2.EOF; ) {
          try {
            switch (b2) {
              case d2.MEDIA_SYM:
                this._media(), this._skipCruft();
                break;
              case d2.PAGE_SYM:
                this._page(), this._skipCruft();
                break;
              case d2.FONT_FACE_SYM:
                this._font_face(), this._skipCruft();
                break;
              case d2.KEYFRAMES_SYM:
                this._keyframes(), this._skipCruft();
                break;
              case d2.VIEWPORT_SYM:
                this._viewport(), this._skipCruft();
                break;
              case d2.DOCUMENT_SYM:
                this._document(), this._skipCruft();
                break;
              case d2.UNKNOWN_SYM:
                if (a.get(), this.options.strict)
                  throw new n("Unknown @ rule.", a.LT(0).startLine, a.LT(0).startCol);
                for (this.fire({ type: "error", error: null, message: "Unknown @ rule: " + a.LT(0).value + ".", line: a.LT(0).startLine, col: a.LT(0).startCol }), o = 0; a.advance([d2.LBRACE, d2.RBRACE]) === d2.LBRACE; )
                  o++;
                for (; o; )
                  a.advance([d2.RBRACE]), o--;
                break;
              case d2.S:
                this._readWhitespace();
                break;
              default:
                if (!this._ruleset())
                  switch (b2) {
                    case d2.CHARSET_SYM:
                      throw u = a.LT(1), this._charset(false), new n("@charset not allowed here.", u.startLine, u.startCol);
                    case d2.IMPORT_SYM:
                      throw u = a.LT(1), this._import(false), new n("@import not allowed here.", u.startLine, u.startCol);
                    case d2.NAMESPACE_SYM:
                      throw u = a.LT(1), this._namespace(false), new n("@namespace not allowed here.", u.startLine, u.startCol);
                    default:
                      a.get(), this._unexpectedToken(a.token());
                  }
            }
          } catch (T) {
            if (T instanceof n && !this.options.strict)
              this.fire({ type: "error", error: T, message: T.message, line: T.line, col: T.col });
            else
              throw T;
          }
          b2 = a.peek();
        }
        b2 !== d2.EOF && this._unexpectedToken(a.token()), this.fire("endstylesheet");
      }, _charset: function(a) {
        var o = this._tokenStream, u, b2, T, I;
        o.match(d2.CHARSET_SYM) && (T = o.token().startLine, I = o.token().startCol, this._readWhitespace(), o.mustMatch(d2.STRING), b2 = o.token(), u = b2.value, this._readWhitespace(), o.mustMatch(d2.SEMICOLON), a !== false && this.fire({ type: "charset", charset: u, line: T, col: I }));
      }, _import: function(a) {
        var o = this._tokenStream, u, b2, T = [];
        o.mustMatch(d2.IMPORT_SYM), b2 = o.token(), this._readWhitespace(), o.mustMatch([d2.STRING, d2.URI]), u = o.token().value.replace(/^(?:url\()?["']?([^"']+?)["']?\)?$/, "$1"), this._readWhitespace(), T = this._media_query_list(), o.mustMatch(d2.SEMICOLON), this._readWhitespace(), a !== false && this.fire({ type: "import", uri: u, media: T, line: b2.startLine, col: b2.startCol });
      }, _namespace: function(a) {
        var o = this._tokenStream, u, b2, T, I;
        o.mustMatch(d2.NAMESPACE_SYM), u = o.token().startLine, b2 = o.token().startCol, this._readWhitespace(), o.match(d2.IDENT) && (T = o.token().value, this._readWhitespace()), o.mustMatch([d2.STRING, d2.URI]), I = o.token().value.replace(/(?:url\()?["']([^"']+)["']\)?/, "$1"), this._readWhitespace(), o.mustMatch(d2.SEMICOLON), this._readWhitespace(), a !== false && this.fire({ type: "namespace", prefix: T, uri: I, line: u, col: b2 });
      }, _media: function() {
        var a = this._tokenStream, o, u, b2;
        for (a.mustMatch(d2.MEDIA_SYM), o = a.token().startLine, u = a.token().startCol, this._readWhitespace(), b2 = this._media_query_list(), a.mustMatch(d2.LBRACE), this._readWhitespace(), this.fire({ type: "startmedia", media: b2, line: o, col: u }); ; )
          if (a.peek() === d2.PAGE_SYM)
            this._page();
          else if (a.peek() === d2.FONT_FACE_SYM)
            this._font_face();
          else if (a.peek() === d2.VIEWPORT_SYM)
            this._viewport();
          else if (a.peek() === d2.DOCUMENT_SYM)
            this._document();
          else if (!this._ruleset())
            break;
        a.mustMatch(d2.RBRACE), this._readWhitespace(), this.fire({ type: "endmedia", media: b2, line: o, col: u });
      }, _media_query_list: function() {
        var a = this._tokenStream, o = [];
        for (this._readWhitespace(), (a.peek() === d2.IDENT || a.peek() === d2.LPAREN) && o.push(this._media_query()); a.match(d2.COMMA); )
          this._readWhitespace(), o.push(this._media_query());
        return o;
      }, _media_query: function() {
        var a = this._tokenStream, o = null, u = null, b2 = null, T = [];
        if (a.match(d2.IDENT) && (u = a.token().value.toLowerCase(), u !== "only" && u !== "not" ? (a.unget(), u = null) : b2 = a.token()), this._readWhitespace(), a.peek() === d2.IDENT ? (o = this._media_type(), b2 === null && (b2 = a.token())) : a.peek() === d2.LPAREN && (b2 === null && (b2 = a.LT(1)), T.push(this._media_expression())), o === null && T.length === 0)
          return null;
        for (this._readWhitespace(); a.match(d2.IDENT); )
          a.token().value.toLowerCase() !== "and" && this._unexpectedToken(a.token()), this._readWhitespace(), T.push(this._media_expression());
        return new w(u, o, T, b2.startLine, b2.startCol);
      }, _media_type: function() {
        return this._media_feature();
      }, _media_expression: function() {
        var a = this._tokenStream, o = null, u, b2 = null;
        return a.mustMatch(d2.LPAREN), o = this._media_feature(), this._readWhitespace(), a.match(d2.COLON) && (this._readWhitespace(), u = a.LT(1), b2 = this._expression()), a.mustMatch(d2.RPAREN), this._readWhitespace(), new y(o, b2 ? new l(b2, u.startLine, u.startCol) : null);
      }, _media_feature: function() {
        var a = this._tokenStream;
        return this._readWhitespace(), a.mustMatch(d2.IDENT), l.fromToken(a.token());
      }, _page: function() {
        var a = this._tokenStream, o, u, b2 = null, T = null;
        a.mustMatch(d2.PAGE_SYM), o = a.token().startLine, u = a.token().startCol, this._readWhitespace(), a.match(d2.IDENT) && (b2 = a.token().value, b2.toLowerCase() === "auto" && this._unexpectedToken(a.token())), a.peek() === d2.COLON && (T = this._pseudo_page()), this._readWhitespace(), this.fire({ type: "startpage", id: b2, pseudo: T, line: o, col: u }), this._readDeclarations(true, true), this.fire({ type: "endpage", id: b2, pseudo: T, line: o, col: u });
      }, _margin: function() {
        var a = this._tokenStream, o, u, b2 = this._margin_sym();
        return b2 ? (o = a.token().startLine, u = a.token().startCol, this.fire({ type: "startpagemargin", margin: b2, line: o, col: u }), this._readDeclarations(true), this.fire({ type: "endpagemargin", margin: b2, line: o, col: u }), true) : false;
      }, _margin_sym: function() {
        var a = this._tokenStream;
        return a.match([d2.TOPLEFTCORNER_SYM, d2.TOPLEFT_SYM, d2.TOPCENTER_SYM, d2.TOPRIGHT_SYM, d2.TOPRIGHTCORNER_SYM, d2.BOTTOMLEFTCORNER_SYM, d2.BOTTOMLEFT_SYM, d2.BOTTOMCENTER_SYM, d2.BOTTOMRIGHT_SYM, d2.BOTTOMRIGHTCORNER_SYM, d2.LEFTTOP_SYM, d2.LEFTMIDDLE_SYM, d2.LEFTBOTTOM_SYM, d2.RIGHTTOP_SYM, d2.RIGHTMIDDLE_SYM, d2.RIGHTBOTTOM_SYM]) ? l.fromToken(a.token()) : null;
      }, _pseudo_page: function() {
        var a = this._tokenStream;
        return a.mustMatch(d2.COLON), a.mustMatch(d2.IDENT), a.token().value;
      }, _font_face: function() {
        var a = this._tokenStream, o, u;
        a.mustMatch(d2.FONT_FACE_SYM), o = a.token().startLine, u = a.token().startCol, this._readWhitespace(), this.fire({ type: "startfontface", line: o, col: u }), this._readDeclarations(true), this.fire({ type: "endfontface", line: o, col: u });
      }, _viewport: function() {
        var a = this._tokenStream, o, u;
        a.mustMatch(d2.VIEWPORT_SYM), o = a.token().startLine, u = a.token().startCol, this._readWhitespace(), this.fire({ type: "startviewport", line: o, col: u }), this._readDeclarations(true), this.fire({ type: "endviewport", line: o, col: u });
      }, _document: function() {
        var a = this._tokenStream, o, u = [], b2 = "";
        for (a.mustMatch(d2.DOCUMENT_SYM), o = a.token(), /^@\-([^\-]+)\-/.test(o.value) && (b2 = RegExp.$1), this._readWhitespace(), u.push(this._document_function()); a.match(d2.COMMA); )
          this._readWhitespace(), u.push(this._document_function());
        for (a.mustMatch(d2.LBRACE), this._readWhitespace(), this.fire({ type: "startdocument", functions: u, prefix: b2, line: o.startLine, col: o.startCol }); ; )
          if (a.peek() === d2.PAGE_SYM)
            this._page();
          else if (a.peek() === d2.FONT_FACE_SYM)
            this._font_face();
          else if (a.peek() === d2.VIEWPORT_SYM)
            this._viewport();
          else if (a.peek() === d2.MEDIA_SYM)
            this._media();
          else if (!this._ruleset())
            break;
        a.mustMatch(d2.RBRACE), this._readWhitespace(), this.fire({ type: "enddocument", functions: u, prefix: b2, line: o.startLine, col: o.startCol });
      }, _document_function: function() {
        var a = this._tokenStream, o;
        return a.match(d2.URI) ? (o = a.token().value, this._readWhitespace()) : o = this._function(), o;
      }, _operator: function(a) {
        var o = this._tokenStream, u = null;
        return (o.match([d2.SLASH, d2.COMMA]) || a && o.match([d2.PLUS, d2.STAR, d2.MINUS])) && (u = o.token(), this._readWhitespace()), u ? re.fromToken(u) : null;
      }, _combinator: function() {
        var a = this._tokenStream, o = null, u;
        return a.match([d2.PLUS, d2.GREATER, d2.TILDE]) && (u = a.token(), o = new _(u.value, u.startLine, u.startCol), this._readWhitespace()), o;
      }, _unary_operator: function() {
        var a = this._tokenStream;
        return a.match([d2.MINUS, d2.PLUS]) ? a.token().value : null;
      }, _property: function() {
        var a = this._tokenStream, o = null, u = null, b2, T, I, L;
        return a.peek() === d2.STAR && this.options.starHack && (a.get(), T = a.token(), u = T.value, I = T.startLine, L = T.startCol), a.match(d2.IDENT) && (T = a.token(), b2 = T.value, b2.charAt(0) === "_" && this.options.underscoreHack && (u = "_", b2 = b2.substring(1)), o = new ae(b2, u, I || T.startLine, L || T.startCol), this._readWhitespace()), o;
      }, _ruleset: function() {
        var a = this._tokenStream, o, u;
        try {
          u = this._selectors_group();
        } catch (b2) {
          if (b2 instanceof n && !this.options.strict) {
            if (this.fire({ type: "error", error: b2, message: b2.message, line: b2.line, col: b2.col }), o = a.advance([d2.RBRACE]), o !== d2.RBRACE)
              throw b2;
          } else
            throw b2;
          return true;
        }
        return u && (this.fire({ type: "startrule", selectors: u, line: u[0].line, col: u[0].col }), this._readDeclarations(true), this.fire({ type: "endrule", selectors: u, line: u[0].line, col: u[0].col })), u;
      }, _selectors_group: function() {
        var a = this._tokenStream, o = [], u;
        if (u = this._selector(), u !== null)
          for (o.push(u); a.match(d2.COMMA); )
            this._readWhitespace(), u = this._selector(), u !== null ? o.push(u) : this._unexpectedToken(a.LT(1));
        return o.length ? o : null;
      }, _selector: function() {
        var a = this._tokenStream, o = [], u = null, b2 = null, T = null;
        if (u = this._simple_selector_sequence(), u === null)
          return null;
        o.push(u);
        do
          if (b2 = this._combinator(), b2 !== null)
            o.push(b2), u = this._simple_selector_sequence(), u === null ? this._unexpectedToken(a.LT(1)) : o.push(u);
          else if (this._readWhitespace())
            T = new _(a.token().value, a.token().startLine, a.token().startCol), b2 = this._combinator(), u = this._simple_selector_sequence(), u === null ? b2 !== null && this._unexpectedToken(a.LT(1)) : (b2 !== null ? o.push(b2) : o.push(T), o.push(u));
          else
            break;
        while (true);
        return new V(o, o[0].line, o[0].col);
      }, _simple_selector_sequence: function() {
        var a = this._tokenStream, o = null, u = [], b2 = "", T = [function() {
          return a.match(d2.HASH) ? new U(a.token().value, "id", a.token().startLine, a.token().startCol) : null;
        }, this._class, this._attrib, this._pseudo, this._negation], I = 0, L = T.length, oe = null, We, dt;
        for (We = a.LT(1).startLine, dt = a.LT(1).startCol, o = this._type_selector(), o || (o = this._universal()), o !== null && (b2 += o); a.peek() !== d2.S; ) {
          for (; I < L && oe === null; )
            oe = T[I++].call(this);
          if (oe === null) {
            if (b2 === "")
              return null;
            break;
          } else
            I = 0, u.push(oe), b2 += oe.toString(), oe = null;
        }
        return b2 !== "" ? new ve(o, u, b2, We, dt) : null;
      }, _type_selector: function() {
        var a = this._tokenStream, o = this._namespace_prefix(), u = this._element_name();
        return u ? (o && (u.text = o + u.text, u.col -= o.length), u) : (o && (a.unget(), o.length > 1 && a.unget()), null);
      }, _class: function() {
        var a = this._tokenStream, o;
        return a.match(d2.DOT) ? (a.mustMatch(d2.IDENT), o = a.token(), new U("." + o.value, "class", o.startLine, o.startCol - 1)) : null;
      }, _element_name: function() {
        var a = this._tokenStream, o;
        return a.match(d2.IDENT) ? (o = a.token(), new U(o.value, "elementName", o.startLine, o.startCol)) : null;
      }, _namespace_prefix: function() {
        var a = this._tokenStream, o = "";
        return (a.LA(1) === d2.PIPE || a.LA(2) === d2.PIPE) && (a.match([d2.IDENT, d2.STAR]) && (o += a.token().value), a.mustMatch(d2.PIPE), o += "|"), o.length ? o : null;
      }, _universal: function() {
        var a = this._tokenStream, o = "", u;
        return u = this._namespace_prefix(), u && (o += u), a.match(d2.STAR) && (o += "*"), o.length ? o : null;
      }, _attrib: function() {
        var a = this._tokenStream, o = null, u, b2;
        return a.match(d2.LBRACKET) ? (b2 = a.token(), o = b2.value, o += this._readWhitespace(), u = this._namespace_prefix(), u && (o += u), a.mustMatch(d2.IDENT), o += a.token().value, o += this._readWhitespace(), a.match([d2.PREFIXMATCH, d2.SUFFIXMATCH, d2.SUBSTRINGMATCH, d2.EQUALS, d2.INCLUDES, d2.DASHMATCH]) && (o += a.token().value, o += this._readWhitespace(), a.mustMatch([d2.IDENT, d2.STRING]), o += a.token().value, o += this._readWhitespace()), a.mustMatch(d2.RBRACKET), new U(o + "]", "attribute", b2.startLine, b2.startCol)) : null;
      }, _pseudo: function() {
        var a = this._tokenStream, o = null, u = ":", b2, T;
        return a.match(d2.COLON) && (a.match(d2.COLON) && (u += ":"), a.match(d2.IDENT) ? (o = a.token().value, b2 = a.token().startLine, T = a.token().startCol - u.length) : a.peek() === d2.FUNCTION && (b2 = a.LT(1).startLine, T = a.LT(1).startCol - u.length, o = this._functional_pseudo()), o && (o = new U(u + o, "pseudo", b2, T))), o;
      }, _functional_pseudo: function() {
        var a = this._tokenStream, o = null;
        return a.match(d2.FUNCTION) && (o = a.token().value, o += this._readWhitespace(), o += this._expression(), a.mustMatch(d2.RPAREN), o += ")"), o;
      }, _expression: function() {
        for (var a = this._tokenStream, o = ""; a.match([d2.PLUS, d2.MINUS, d2.DIMENSION, d2.NUMBER, d2.STRING, d2.IDENT, d2.LENGTH, d2.FREQ, d2.ANGLE, d2.TIME, d2.RESOLUTION, d2.SLASH]); )
          o += a.token().value, o += this._readWhitespace();
        return o.length ? o : null;
      }, _negation: function() {
        var a = this._tokenStream, o, u, b2 = "", T, I = null;
        return a.match(d2.NOT) && (b2 = a.token().value, o = a.token().startLine, u = a.token().startCol, b2 += this._readWhitespace(), T = this._negation_arg(), b2 += T, b2 += this._readWhitespace(), a.match(d2.RPAREN), b2 += a.token().value, I = new U(b2, "not", o, u), I.args.push(T)), I;
      }, _negation_arg: function() {
        var a = this._tokenStream, o = [this._type_selector, this._universal, function() {
          return a.match(d2.HASH) ? new U(a.token().value, "id", a.token().startLine, a.token().startCol) : null;
        }, this._class, this._attrib, this._pseudo], u = null, b2 = 0, T = o.length, I, L, oe;
        for (I = a.LT(1).startLine, L = a.LT(1).startCol; b2 < T && u === null; )
          u = o[b2].call(this), b2++;
        return u === null && this._unexpectedToken(a.LT(1)), u.type === "elementName" ? oe = new ve(u, [], u.toString(), I, L) : oe = new ve(null, [u], u.toString(), I, L), oe;
      }, _declaration: function() {
        var a = this._tokenStream, o = null, u = null, b2 = null, T = null, I = "";
        if (o = this._property(), o !== null) {
          a.mustMatch(d2.COLON), this._readWhitespace(), u = this._expr(), (!u || u.length === 0) && this._unexpectedToken(a.LT(1)), b2 = this._prio(), I = o.toString(), (this.options.starHack && o.hack === "*" || this.options.underscoreHack && o.hack === "_") && (I = o.text);
          try {
            this._validateProperty(I, u);
          } catch (L) {
            T = L;
          }
          return this.fire({ type: "property", property: o, value: u, important: b2, line: o.line, col: o.col, invalid: T }), true;
        } else
          return false;
      }, _prio: function() {
        var a = this._tokenStream, o = a.match(d2.IMPORTANT_SYM);
        return this._readWhitespace(), o;
      }, _expr: function(a) {
        var o = [], u = null, b2 = null;
        if (u = this._term(a), u !== null) {
          o.push(u);
          do {
            if (b2 = this._operator(a), b2 && o.push(b2), u = this._term(a), u === null)
              break;
            o.push(u);
          } while (true);
        }
        return o.length > 0 ? new ce(o, o[0].line, o[0].col) : null;
      }, _term: function(a) {
        var o = this._tokenStream, u = null, b2 = null, T = null, I, L, oe;
        return u = this._unary_operator(), u !== null && (L = o.token().startLine, oe = o.token().startCol), o.peek() === d2.IE_FUNCTION && this.options.ieFilters ? (b2 = this._ie_function(), u === null && (L = o.token().startLine, oe = o.token().startCol)) : a && o.match([d2.LPAREN, d2.LBRACE, d2.LBRACKET]) ? (I = o.token(), T = I.endChar, b2 = I.value + this._expr(a).text, u === null && (L = o.token().startLine, oe = o.token().startCol), o.mustMatch(d2.type(T)), b2 += T, this._readWhitespace()) : o.match([d2.NUMBER, d2.PERCENTAGE, d2.LENGTH, d2.ANGLE, d2.TIME, d2.FREQ, d2.STRING, d2.IDENT, d2.URI, d2.UNICODE_RANGE]) ? (b2 = o.token().value, u === null && (L = o.token().startLine, oe = o.token().startCol), this._readWhitespace()) : (I = this._hexcolor(), I === null ? (u === null && (L = o.LT(1).startLine, oe = o.LT(1).startCol), b2 === null && (o.LA(3) === d2.EQUALS && this.options.ieFilters ? b2 = this._ie_function() : b2 = this._function())) : (b2 = I.value, u === null && (L = I.startLine, oe = I.startCol))), b2 !== null ? new re(u !== null ? u + b2 : b2, L, oe) : null;
      }, _function: function() {
        var a = this._tokenStream, o = null, u = null, b2;
        if (a.match(d2.FUNCTION)) {
          if (o = a.token().value, this._readWhitespace(), u = this._expr(true), o += u, this.options.ieFilters && a.peek() === d2.EQUALS)
            do
              for (this._readWhitespace() && (o += a.token().value), a.LA(0) === d2.COMMA && (o += a.token().value), a.match(d2.IDENT), o += a.token().value, a.match(d2.EQUALS), o += a.token().value, b2 = a.peek(); b2 !== d2.COMMA && b2 !== d2.S && b2 !== d2.RPAREN; )
                a.get(), o += a.token().value, b2 = a.peek();
            while (a.match([d2.COMMA, d2.S]));
          a.match(d2.RPAREN), o += ")", this._readWhitespace();
        }
        return o;
      }, _ie_function: function() {
        var a = this._tokenStream, o = null, u;
        if (a.match([d2.IE_FUNCTION, d2.FUNCTION])) {
          o = a.token().value;
          do
            for (this._readWhitespace() && (o += a.token().value), a.LA(0) === d2.COMMA && (o += a.token().value), a.match(d2.IDENT), o += a.token().value, a.match(d2.EQUALS), o += a.token().value, u = a.peek(); u !== d2.COMMA && u !== d2.S && u !== d2.RPAREN; )
              a.get(), o += a.token().value, u = a.peek();
          while (a.match([d2.COMMA, d2.S]));
          a.match(d2.RPAREN), o += ")", this._readWhitespace();
        }
        return o;
      }, _hexcolor: function() {
        var a = this._tokenStream, o = null, u;
        if (a.match(d2.HASH)) {
          if (o = a.token(), u = o.value, !/#[a-f0-9]{3,6}/i.test(u))
            throw new n("Expected a hex color but found '" + u + "' at line " + o.startLine + ", col " + o.startCol + ".", o.startLine, o.startCol);
          this._readWhitespace();
        }
        return o;
      }, _keyframes: function() {
        var a = this._tokenStream, o, u, b2, T = "";
        for (a.mustMatch(d2.KEYFRAMES_SYM), o = a.token(), /^@\-([^\-]+)\-/.test(o.value) && (T = RegExp.$1), this._readWhitespace(), b2 = this._keyframe_name(), this._readWhitespace(), a.mustMatch(d2.LBRACE), this.fire({ type: "startkeyframes", name: b2, prefix: T, line: o.startLine, col: o.startCol }), this._readWhitespace(), u = a.peek(); u === d2.IDENT || u === d2.PERCENTAGE; )
          this._keyframe_rule(), this._readWhitespace(), u = a.peek();
        this.fire({ type: "endkeyframes", name: b2, prefix: T, line: o.startLine, col: o.startCol }), this._readWhitespace(), a.mustMatch(d2.RBRACE);
      }, _keyframe_name: function() {
        var a = this._tokenStream;
        return a.mustMatch([d2.IDENT, d2.STRING]), l.fromToken(a.token());
      }, _keyframe_rule: function() {
        var a = this._key_list();
        this.fire({ type: "startkeyframerule", keys: a, line: a[0].line, col: a[0].col }), this._readDeclarations(true), this.fire({ type: "endkeyframerule", keys: a, line: a[0].line, col: a[0].col });
      }, _key_list: function() {
        var a = this._tokenStream, o = [];
        for (o.push(this._key()), this._readWhitespace(); a.match(d2.COMMA); )
          this._readWhitespace(), o.push(this._key()), this._readWhitespace();
        return o;
      }, _key: function() {
        var a = this._tokenStream, o;
        if (a.match(d2.PERCENTAGE))
          return l.fromToken(a.token());
        if (a.match(d2.IDENT)) {
          if (o = a.token(), /from|to/i.test(o.value))
            return l.fromToken(o);
          a.unget();
        }
        this._unexpectedToken(a.LT(1));
      }, _skipCruft: function() {
        for (; this._tokenStream.match([d2.S, d2.CDO, d2.CDC]); )
          ;
      }, _readDeclarations: function(a, o) {
        var u = this._tokenStream, b2;
        this._readWhitespace(), a && u.mustMatch(d2.LBRACE), this._readWhitespace();
        try {
          for (; ; ) {
            if (!(u.match(d2.SEMICOLON) || o && this._margin()))
              if (this._declaration()) {
                if (!u.match(d2.SEMICOLON))
                  break;
              } else
                break;
            this._readWhitespace();
          }
          u.mustMatch(d2.RBRACE), this._readWhitespace();
        } catch (T) {
          if (T instanceof n && !this.options.strict) {
            if (this.fire({ type: "error", error: T, message: T.message, line: T.line, col: T.col }), b2 = u.advance([d2.SEMICOLON, d2.RBRACE]), b2 === d2.SEMICOLON)
              this._readDeclarations(false, o);
            else if (b2 !== d2.RBRACE)
              throw T;
          } else
            throw T;
        }
      }, _readWhitespace: function() {
        for (var a = this._tokenStream, o = ""; a.match(d2.S); )
          o += a.token().value;
        return o;
      }, _unexpectedToken: function(a) {
        throw new n("Unexpected token '" + a.value + "' at line " + a.startLine + ", col " + a.startCol + ".", a.startLine, a.startCol);
      }, _verifyEnd: function() {
        this._tokenStream.LA(1) !== d2.EOF && this._unexpectedToken(this._tokenStream.LT(1));
      }, _validateProperty: function(a, o) {
        Xe.validate(a, o);
      }, parse: function(a) {
        this._tokenStream = new p(a), this._stylesheet();
      }, parseStyleSheet: function(a) {
        return this.parse(a);
      }, parseMediaQuery: function(a) {
        this._tokenStream = new p(a);
        var o = this._media_query();
        return this._verifyEnd(), o;
      }, parsePropertyValue: function(a) {
        this._tokenStream = new p(a), this._readWhitespace();
        var o = this._expr();
        return this._readWhitespace(), this._verifyEnd(), o;
      }, parseRule: function(a) {
        this._tokenStream = new p(a), this._readWhitespace();
        var o = this._ruleset();
        return this._readWhitespace(), this._verifyEnd(), o;
      }, parseSelector: function(a) {
        this._tokenStream = new p(a), this._readWhitespace();
        var o = this._selector();
        return this._readWhitespace(), this._verifyEnd(), o;
      }, parseStyleAttribute: function(a) {
        a += "}", this._tokenStream = new p(a), this._readDeclarations();
      } };
      for (h2 in m)
        Object.prototype.hasOwnProperty.call(m, h2) && (c2[h2] = m[h2]);
      return c2;
    }();
    var D = { __proto__: null, "align-items": "flex-start | flex-end | center | baseline | stretch", "align-content": "flex-start | flex-end | center | space-between | space-around | stretch", "align-self": "auto | flex-start | flex-end | center | baseline | stretch", "-webkit-align-items": "flex-start | flex-end | center | baseline | stretch", "-webkit-align-content": "flex-start | flex-end | center | space-between | space-around | stretch", "-webkit-align-self": "auto | flex-start | flex-end | center | baseline | stretch", "alignment-adjust": "auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical | <percentage> | <length>", "alignment-baseline": "baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical", animation: 1, "animation-delay": { multi: "<time>", comma: true }, "animation-direction": { multi: "normal | alternate", comma: true }, "animation-duration": { multi: "<time>", comma: true }, "animation-fill-mode": { multi: "none | forwards | backwards | both", comma: true }, "animation-iteration-count": { multi: "<number> | infinite", comma: true }, "animation-name": { multi: "none | <ident>", comma: true }, "animation-play-state": { multi: "running | paused", comma: true }, "animation-timing-function": 1, "-moz-animation-delay": { multi: "<time>", comma: true }, "-moz-animation-direction": { multi: "normal | alternate", comma: true }, "-moz-animation-duration": { multi: "<time>", comma: true }, "-moz-animation-iteration-count": { multi: "<number> | infinite", comma: true }, "-moz-animation-name": { multi: "none | <ident>", comma: true }, "-moz-animation-play-state": { multi: "running | paused", comma: true }, "-ms-animation-delay": { multi: "<time>", comma: true }, "-ms-animation-direction": { multi: "normal | alternate", comma: true }, "-ms-animation-duration": { multi: "<time>", comma: true }, "-ms-animation-iteration-count": { multi: "<number> | infinite", comma: true }, "-ms-animation-name": { multi: "none | <ident>", comma: true }, "-ms-animation-play-state": { multi: "running | paused", comma: true }, "-webkit-animation-delay": { multi: "<time>", comma: true }, "-webkit-animation-direction": { multi: "normal | alternate", comma: true }, "-webkit-animation-duration": { multi: "<time>", comma: true }, "-webkit-animation-fill-mode": { multi: "none | forwards | backwards | both", comma: true }, "-webkit-animation-iteration-count": { multi: "<number> | infinite", comma: true }, "-webkit-animation-name": { multi: "none | <ident>", comma: true }, "-webkit-animation-play-state": { multi: "running | paused", comma: true }, "-o-animation-delay": { multi: "<time>", comma: true }, "-o-animation-direction": { multi: "normal | alternate", comma: true }, "-o-animation-duration": { multi: "<time>", comma: true }, "-o-animation-iteration-count": { multi: "<number> | infinite", comma: true }, "-o-animation-name": { multi: "none | <ident>", comma: true }, "-o-animation-play-state": { multi: "running | paused", comma: true }, appearance: "icon | window | desktop | workspace | document | tooltip | dialog | button | push-button | hyperlink | radio | radio-button | checkbox | menu-item | tab | menu | menubar | pull-down-menu | pop-up-menu | list-menu | radio-group | checkbox-group | outline-tree | range | field | combo-box | signature | password | normal | none | inherit", azimuth: function(c2) {
      var h2 = "<angle> | leftwards | rightwards | inherit", m = "left-side | far-left | left | center-left | center | center-right | right | far-right | right-side", a = false, o = false, u;
      if (A.isAny(c2, h2) || (A.isAny(c2, "behind") && (a = true, o = true), A.isAny(c2, m) && (o = true, a || A.isAny(c2, "behind"))), c2.hasNext())
        throw u = c2.next(), o ? new se("Expected end of value but found '" + u + "'.", u.line, u.col) : new se("Expected (<'azimuth'>) but found '" + u + "'.", u.line, u.col);
    }, "backface-visibility": "visible | hidden", background: 1, "background-attachment": { multi: "<attachment>", comma: true }, "background-clip": { multi: "<box>", comma: true }, "background-color": "<color> | inherit", "background-image": { multi: "<bg-image>", comma: true }, "background-origin": { multi: "<box>", comma: true }, "background-position": { multi: "<bg-position>", comma: true }, "background-repeat": { multi: "<repeat-style>" }, "background-size": { multi: "<bg-size>", comma: true }, "baseline-shift": "baseline | sub | super | <percentage> | <length>", behavior: 1, binding: 1, bleed: "<length>", "bookmark-label": "<content> | <attr> | <string>", "bookmark-level": "none | <integer>", "bookmark-state": "open | closed", "bookmark-target": "none | <uri> | <attr>", border: "<border-width> || <border-style> || <color>", "border-bottom": "<border-width> || <border-style> || <color>", "border-bottom-color": "<color> | inherit", "border-bottom-left-radius": "<x-one-radius>", "border-bottom-right-radius": "<x-one-radius>", "border-bottom-style": "<border-style>", "border-bottom-width": "<border-width>", "border-collapse": "collapse | separate | inherit", "border-color": { multi: "<color> | inherit", max: 4 }, "border-image": 1, "border-image-outset": { multi: "<length> | <number>", max: 4 }, "border-image-repeat": { multi: "stretch | repeat | round", max: 2 }, "border-image-slice": function(c2) {
      var h2 = false, m = "<number> | <percentage>", a = false, o = 0, u = 4, b2;
      for (A.isAny(c2, "fill") && (a = true, h2 = true); c2.hasNext() && o < u && (h2 = A.isAny(c2, m), !!h2); )
        o++;
      if (a ? h2 = true : A.isAny(c2, "fill"), c2.hasNext())
        throw b2 = c2.next(), h2 ? new se("Expected end of value but found '" + b2 + "'.", b2.line, b2.col) : new se("Expected ([<number> | <percentage>]{1,4} && fill?) but found '" + b2 + "'.", b2.line, b2.col);
    }, "border-image-source": "<image> | none", "border-image-width": { multi: "<length> | <percentage> | <number> | auto", max: 4 }, "border-left": "<border-width> || <border-style> || <color>", "border-left-color": "<color> | inherit", "border-left-style": "<border-style>", "border-left-width": "<border-width>", "border-radius": function(c2) {
      for (var h2 = false, m = "<length> | <percentage> | inherit", a = false, o = 0, u = 8, b2; c2.hasNext() && o < u; ) {
        if (h2 = A.isAny(c2, m), !h2)
          if (String(c2.peek()) === "/" && o > 0 && !a)
            a = true, u = o + 5, c2.next();
          else
            break;
        o++;
      }
      if (c2.hasNext())
        throw b2 = c2.next(), h2 ? new se("Expected end of value but found '" + b2 + "'.", b2.line, b2.col) : new se("Expected (<'border-radius'>) but found '" + b2 + "'.", b2.line, b2.col);
    }, "border-right": "<border-width> || <border-style> || <color>", "border-right-color": "<color> | inherit", "border-right-style": "<border-style>", "border-right-width": "<border-width>", "border-spacing": { multi: "<length> | inherit", max: 2 }, "border-style": { multi: "<border-style>", max: 4 }, "border-top": "<border-width> || <border-style> || <color>", "border-top-color": "<color> | inherit", "border-top-left-radius": "<x-one-radius>", "border-top-right-radius": "<x-one-radius>", "border-top-style": "<border-style>", "border-top-width": "<border-width>", "border-width": { multi: "<border-width>", max: 4 }, bottom: "<margin-width> | inherit", "-moz-box-align": "start | end | center | baseline | stretch", "-moz-box-decoration-break": "slice |clone", "-moz-box-direction": "normal | reverse | inherit", "-moz-box-flex": "<number>", "-moz-box-flex-group": "<integer>", "-moz-box-lines": "single | multiple", "-moz-box-ordinal-group": "<integer>", "-moz-box-orient": "horizontal | vertical | inline-axis | block-axis | inherit", "-moz-box-pack": "start | end | center | justify", "-o-box-decoration-break": "slice | clone", "-webkit-box-align": "start | end | center | baseline | stretch", "-webkit-box-decoration-break": "slice |clone", "-webkit-box-direction": "normal | reverse | inherit", "-webkit-box-flex": "<number>", "-webkit-box-flex-group": "<integer>", "-webkit-box-lines": "single | multiple", "-webkit-box-ordinal-group": "<integer>", "-webkit-box-orient": "horizontal | vertical | inline-axis | block-axis | inherit", "-webkit-box-pack": "start | end | center | justify", "box-decoration-break": "slice | clone", "box-shadow": function(c2) {
      var h2;
      if (!A.isAny(c2, "none"))
        Xe.multiProperty("<shadow>", c2, true, 1 / 0);
      else if (c2.hasNext())
        throw h2 = c2.next(), new se("Expected end of value but found '" + h2 + "'.", h2.line, h2.col);
    }, "box-sizing": "content-box | border-box | inherit", "break-after": "auto | always | avoid | left | right | page | column | avoid-page | avoid-column", "break-before": "auto | always | avoid | left | right | page | column | avoid-page | avoid-column", "break-inside": "auto | avoid | avoid-page | avoid-column", "caption-side": "top | bottom | inherit", clear: "none | right | left | both | inherit", clip: 1, color: "<color> | inherit", "color-profile": 1, "column-count": "<integer> | auto", "column-fill": "auto | balance", "column-gap": "<length> | normal", "column-rule": "<border-width> || <border-style> || <color>", "column-rule-color": "<color>", "column-rule-style": "<border-style>", "column-rule-width": "<border-width>", "column-span": "none | all", "column-width": "<length> | auto", columns: 1, content: 1, "counter-increment": 1, "counter-reset": 1, crop: "<shape> | auto", cue: "cue-after | cue-before | inherit", "cue-after": 1, "cue-before": 1, cursor: 1, direction: "ltr | rtl | inherit", display: "inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | grid | inline-grid | run-in | ruby | ruby-base | ruby-text | ruby-base-container | ruby-text-container | contents | none | inherit | -moz-box | -moz-inline-block | -moz-inline-box | -moz-inline-grid | -moz-inline-stack | -moz-inline-table | -moz-grid | -moz-grid-group | -moz-grid-line | -moz-groupbox | -moz-deck | -moz-popup | -moz-stack | -moz-marker | -webkit-box | -webkit-inline-box | -ms-flexbox | -ms-inline-flexbox | flex | -webkit-flex | inline-flex | -webkit-inline-flex", "dominant-baseline": 1, "drop-initial-after-adjust": "central | middle | after-edge | text-after-edge | ideographic | alphabetic | mathematical | <percentage> | <length>", "drop-initial-after-align": "baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical", "drop-initial-before-adjust": "before-edge | text-before-edge | central | middle | hanging | mathematical | <percentage> | <length>", "drop-initial-before-align": "caps-height | baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical", "drop-initial-size": "auto | line | <length> | <percentage>", "drop-initial-value": "initial | <integer>", elevation: "<angle> | below | level | above | higher | lower | inherit", "empty-cells": "show | hide | inherit", filter: 1, fit: "fill | hidden | meet | slice", "fit-position": 1, flex: "<flex>", "flex-basis": "<width>", "flex-direction": "row | row-reverse | column | column-reverse", "flex-flow": "<flex-direction> || <flex-wrap>", "flex-grow": "<number>", "flex-shrink": "<number>", "flex-wrap": "nowrap | wrap | wrap-reverse", "-webkit-flex": "<flex>", "-webkit-flex-basis": "<width>", "-webkit-flex-direction": "row | row-reverse | column | column-reverse", "-webkit-flex-flow": "<flex-direction> || <flex-wrap>", "-webkit-flex-grow": "<number>", "-webkit-flex-shrink": "<number>", "-webkit-flex-wrap": "nowrap | wrap | wrap-reverse", "-ms-flex": "<flex>", "-ms-flex-align": "start | end | center | stretch | baseline", "-ms-flex-direction": "row | row-reverse | column | column-reverse | inherit", "-ms-flex-order": "<number>", "-ms-flex-pack": "start | end | center | justify", "-ms-flex-wrap": "nowrap | wrap | wrap-reverse", float: "left | right | none | inherit", "float-offset": 1, font: 1, "font-family": 1, "font-feature-settings": "<feature-tag-value> | normal | inherit", "font-kerning": "auto | normal | none | initial | inherit | unset", "font-size": "<absolute-size> | <relative-size> | <length> | <percentage> | inherit", "font-size-adjust": "<number> | none | inherit", "font-stretch": "normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded | inherit", "font-style": "normal | italic | oblique | inherit", "font-variant": "normal | small-caps | inherit", "font-variant-caps": "normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps", "font-variant-position": "normal | sub | super | inherit | initial | unset", "font-weight": "normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit", grid: 1, "grid-area": 1, "grid-auto-columns": 1, "grid-auto-flow": 1, "grid-auto-position": 1, "grid-auto-rows": 1, "grid-cell-stacking": "columns | rows | layer", "grid-column": 1, "grid-columns": 1, "grid-column-align": "start | end | center | stretch", "grid-column-sizing": 1, "grid-column-start": 1, "grid-column-end": 1, "grid-column-span": "<integer>", "grid-flow": "none | rows | columns", "grid-layer": "<integer>", "grid-row": 1, "grid-rows": 1, "grid-row-align": "start | end | center | stretch", "grid-row-start": 1, "grid-row-end": 1, "grid-row-span": "<integer>", "grid-row-sizing": 1, "grid-template": 1, "grid-template-areas": 1, "grid-template-columns": 1, "grid-template-rows": 1, "hanging-punctuation": 1, height: "<margin-width> | <content-sizing> | inherit", "hyphenate-after": "<integer> | auto", "hyphenate-before": "<integer> | auto", "hyphenate-character": "<string> | auto", "hyphenate-lines": "no-limit | <integer>", "hyphenate-resource": 1, hyphens: "none | manual | auto", icon: 1, "image-orientation": "angle | auto", "image-rendering": 1, "image-resolution": 1, "ime-mode": "auto | normal | active | inactive | disabled | inherit", "inline-box-align": "initial | last | <integer>", "justify-content": "flex-start | flex-end | center | space-between | space-around", "-webkit-justify-content": "flex-start | flex-end | center | space-between | space-around", left: "<margin-width> | inherit", "letter-spacing": "<length> | normal | inherit", "line-height": "<number> | <length> | <percentage> | normal | inherit", "line-break": "auto | loose | normal | strict", "line-stacking": 1, "line-stacking-ruby": "exclude-ruby | include-ruby", "line-stacking-shift": "consider-shifts | disregard-shifts", "line-stacking-strategy": "inline-line-height | block-line-height | max-height | grid-height", "list-style": 1, "list-style-image": "<uri> | none | inherit", "list-style-position": "inside | outside | inherit", "list-style-type": "disc | circle | square | decimal | decimal-leading-zero | lower-roman | upper-roman | lower-greek | lower-latin | upper-latin | armenian | georgian | lower-alpha | upper-alpha | none | inherit", margin: { multi: "<margin-width> | inherit", max: 4 }, "margin-bottom": "<margin-width> | inherit", "margin-left": "<margin-width> | inherit", "margin-right": "<margin-width> | inherit", "margin-top": "<margin-width> | inherit", mark: 1, "mark-after": 1, "mark-before": 1, marks: 1, "marquee-direction": 1, "marquee-play-count": 1, "marquee-speed": 1, "marquee-style": 1, "max-height": "<length> | <percentage> | <content-sizing> | none | inherit", "max-width": "<length> | <percentage> | <content-sizing> | none | inherit", "min-height": "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit", "min-width": "<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit", "move-to": 1, "nav-down": 1, "nav-index": 1, "nav-left": 1, "nav-right": 1, "nav-up": 1, "object-fit": "fill | contain | cover | none | scale-down", "object-position": "<bg-position>", opacity: "<number> | inherit", order: "<integer>", "-webkit-order": "<integer>", orphans: "<integer> | inherit", outline: 1, "outline-color": "<color> | invert | inherit", "outline-offset": 1, "outline-style": "<border-style> | inherit", "outline-width": "<border-width> | inherit", overflow: "visible | hidden | scroll | auto | inherit", "overflow-style": 1, "overflow-wrap": "normal | break-word", "overflow-x": 1, "overflow-y": 1, padding: { multi: "<padding-width> | inherit", max: 4 }, "padding-bottom": "<padding-width> | inherit", "padding-left": "<padding-width> | inherit", "padding-right": "<padding-width> | inherit", "padding-top": "<padding-width> | inherit", page: 1, "page-break-after": "auto | always | avoid | left | right | inherit", "page-break-before": "auto | always | avoid | left | right | inherit", "page-break-inside": "auto | avoid | inherit", "page-policy": 1, pause: 1, "pause-after": 1, "pause-before": 1, perspective: 1, "perspective-origin": 1, phonemes: 1, pitch: 1, "pitch-range": 1, "play-during": 1, "pointer-events": "auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit", position: "static | relative | absolute | fixed | inherit", "presentation-level": 1, "punctuation-trim": 1, quotes: 1, "rendering-intent": 1, resize: 1, rest: 1, "rest-after": 1, "rest-before": 1, richness: 1, right: "<margin-width> | inherit", rotation: 1, "rotation-point": 1, "ruby-align": 1, "ruby-overhang": 1, "ruby-position": 1, "ruby-span": 1, size: 1, speak: "normal | none | spell-out | inherit", "speak-header": "once | always | inherit", "speak-numeral": "digits | continuous | inherit", "speak-punctuation": "code | none | inherit", "speech-rate": 1, src: 1, stress: 1, "string-set": 1, "table-layout": "auto | fixed | inherit", "tab-size": "<integer> | <length>", target: 1, "target-name": 1, "target-new": 1, "target-position": 1, "text-align": "left | right | center | justify | match-parent | start | end | inherit", "text-align-last": 1, "text-decoration": 1, "text-emphasis": 1, "text-height": 1, "text-indent": "<length> | <percentage> | inherit", "text-justify": "auto | none | inter-word | inter-ideograph | inter-cluster | distribute | kashida", "text-outline": 1, "text-overflow": 1, "text-rendering": "auto | optimizeSpeed | optimizeLegibility | geometricPrecision | inherit", "text-shadow": 1, "text-transform": "capitalize | uppercase | lowercase | none | inherit", "text-wrap": "normal | none | avoid", top: "<margin-width> | inherit", "-ms-touch-action": "auto | none | pan-x | pan-y | pan-left | pan-right | pan-up | pan-down | manipulation", "touch-action": "auto | none | pan-x | pan-y | pan-left | pan-right | pan-up | pan-down | manipulation", transform: 1, "transform-origin": 1, "transform-style": 1, transition: 1, "transition-delay": 1, "transition-duration": 1, "transition-property": 1, "transition-timing-function": 1, "unicode-bidi": "normal | embed | isolate | bidi-override | isolate-override | plaintext | inherit", "user-modify": "read-only | read-write | write-only | inherit", "user-select": "none | text | toggle | element | elements | all | inherit", "vertical-align": "auto | use-script | baseline | sub | super | top | text-top | central | middle | bottom | text-bottom | <percentage> | <length> | inherit", visibility: "visible | hidden | collapse | inherit", "voice-balance": 1, "voice-duration": 1, "voice-family": 1, "voice-pitch": 1, "voice-pitch-range": 1, "voice-rate": 1, "voice-stress": 1, "voice-volume": 1, volume: 1, "white-space": "normal | pre | nowrap | pre-wrap | pre-line | inherit | -pre-wrap | -o-pre-wrap | -moz-pre-wrap | -hp-pre-wrap", "white-space-collapse": 1, widows: "<integer> | inherit", width: "<length> | <percentage> | <content-sizing> | auto | inherit", "will-change": { multi: "<ident>", comma: true }, "word-break": "normal | keep-all | break-all", "word-spacing": "<length> | normal | inherit", "word-wrap": "normal | break-word", "writing-mode": "horizontal-tb | vertical-rl | vertical-lr | lr-tb | rl-tb | tb-rl | bt-rl | tb-lr | bt-lr | lr-bt | rl-bt | lr | rl | tb | inherit", "z-index": "<integer> | auto | inherit", zoom: "<number> | <percentage> | normal" };
    function ae(c2, h2, m, a) {
      l.call(this, c2, m, a, S.PROPERTY_NAME_TYPE), this.hack = h2;
    }
    ae.prototype = new l(), ae.prototype.constructor = ae, ae.prototype.toString = function() {
      return (this.hack ? this.hack : "") + this.text;
    };
    function ce(c2, h2, m) {
      l.call(this, c2.join(" "), h2, m, S.PROPERTY_VALUE_TYPE), this.parts = c2;
    }
    ce.prototype = new l(), ce.prototype.constructor = ce;
    function g2(c2) {
      this._i = 0, this._parts = c2.parts, this._marks = [], this.value = c2;
    }
    g2.prototype.count = function() {
      return this._parts.length;
    }, g2.prototype.isFirst = function() {
      return this._i === 0;
    }, g2.prototype.hasNext = function() {
      return this._i < this._parts.length;
    }, g2.prototype.mark = function() {
      this._marks.push(this._i);
    }, g2.prototype.peek = function(c2) {
      return this.hasNext() ? this._parts[this._i + (c2 || 0)] : null;
    }, g2.prototype.next = function() {
      return this.hasNext() ? this._parts[this._i++] : null;
    }, g2.prototype.previous = function() {
      return this._i > 0 ? this._parts[--this._i] : null;
    }, g2.prototype.restore = function() {
      this._marks.length && (this._i = this._marks.pop());
    };
    function re(c2, h2, m) {
      l.call(this, c2, h2, m, S.PROPERTY_VALUE_PART_TYPE), this.type = "unknown";
      var a;
      if (/^([+\-]?[\d\.]+)([a-z]+)$/i.test(c2))
        switch (this.type = "dimension", this.value = +RegExp.$1, this.units = RegExp.$2, this.units.toLowerCase()) {
          case "em":
          case "rem":
          case "ex":
          case "px":
          case "cm":
          case "mm":
          case "in":
          case "pt":
          case "pc":
          case "ch":
          case "vh":
          case "vw":
          case "vmax":
          case "vmin":
            this.type = "length";
            break;
          case "fr":
            this.type = "grid";
            break;
          case "deg":
          case "rad":
          case "grad":
            this.type = "angle";
            break;
          case "ms":
          case "s":
            this.type = "time";
            break;
          case "hz":
          case "khz":
            this.type = "frequency";
            break;
          case "dpi":
          case "dpcm":
            this.type = "resolution";
            break;
        }
      else
        /^([+\-]?[\d\.]+)%$/i.test(c2) ? (this.type = "percentage", this.value = +RegExp.$1) : /^([+\-]?\d+)$/i.test(c2) ? (this.type = "integer", this.value = +RegExp.$1) : /^([+\-]?[\d\.]+)$/i.test(c2) ? (this.type = "number", this.value = +RegExp.$1) : /^#([a-f0-9]{3,6})/i.test(c2) ? (this.type = "color", a = RegExp.$1, a.length === 3 ? (this.red = parseInt(a.charAt(0) + a.charAt(0), 16), this.green = parseInt(a.charAt(1) + a.charAt(1), 16), this.blue = parseInt(a.charAt(2) + a.charAt(2), 16)) : (this.red = parseInt(a.substring(0, 2), 16), this.green = parseInt(a.substring(2, 4), 16), this.blue = parseInt(a.substring(4, 6), 16))) : /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i.test(c2) ? (this.type = "color", this.red = +RegExp.$1, this.green = +RegExp.$2, this.blue = +RegExp.$3) : /^rgb\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i.test(c2) ? (this.type = "color", this.red = +RegExp.$1 * 255 / 100, this.green = +RegExp.$2 * 255 / 100, this.blue = +RegExp.$3 * 255 / 100) : /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/i.test(c2) ? (this.type = "color", this.red = +RegExp.$1, this.green = +RegExp.$2, this.blue = +RegExp.$3, this.alpha = +RegExp.$4) : /^rgba\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d\.]+)\s*\)/i.test(c2) ? (this.type = "color", this.red = +RegExp.$1 * 255 / 100, this.green = +RegExp.$2 * 255 / 100, this.blue = +RegExp.$3 * 255 / 100, this.alpha = +RegExp.$4) : /^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i.test(c2) ? (this.type = "color", this.hue = +RegExp.$1, this.saturation = +RegExp.$2 / 100, this.lightness = +RegExp.$3 / 100) : /^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d\.]+)\s*\)/i.test(c2) ? (this.type = "color", this.hue = +RegExp.$1, this.saturation = +RegExp.$2 / 100, this.lightness = +RegExp.$3 / 100, this.alpha = +RegExp.$4) : /^url\(["']?([^\)"']+)["']?\)/i.test(c2) ? (this.type = "uri", this.uri = RegExp.$1) : /^([^\(]+)\(/i.test(c2) ? (this.type = "function", this.name = RegExp.$1, this.value = c2) : /^"([^\n\r\f\\"]|\\\r\n|\\[^\r0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*"/i.test(c2) ? (this.type = "string", this.value = re.parseString(c2)) : /^'([^\n\r\f\\']|\\\r\n|\\[^\r0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*'/i.test(c2) ? (this.type = "string", this.value = re.parseString(c2)) : f2[c2.toLowerCase()] ? (this.type = "color", a = f2[c2.toLowerCase()].substring(1), this.red = parseInt(a.substring(0, 2), 16), this.green = parseInt(a.substring(2, 4), 16), this.blue = parseInt(a.substring(4, 6), 16)) : /^[\,\/]$/.test(c2) ? (this.type = "operator", this.value = c2) : /^[a-z\-_\u0080-\uFFFF][a-z0-9\-_\u0080-\uFFFF]*$/i.test(c2) && (this.type = "identifier", this.value = c2);
    }
    re.prototype = new l(), re.prototype.constructor = re, re.parseString = function(c2) {
      c2 = c2.slice(1, -1);
      var h2 = function(m, a) {
        if (/^(\n|\r\n|\r|\f)$/.test(a))
          return "";
        var o = /^[0-9a-f]{1,6}/i.exec(a);
        if (o) {
          var u = parseInt(o[0], 16);
          return String.fromCodePoint ? String.fromCodePoint(u) : String.fromCharCode(u);
        }
        return a;
      };
      return c2.replace(/\\(\r\n|[^\r0-9a-f]|[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)/ig, h2);
    }, re.serializeString = function(c2) {
      var h2 = function(m, a) {
        if (a === '"')
          return "\\" + a;
        var o = String.codePointAt ? String.codePointAt(0) : String.charCodeAt(0);
        return "\\" + o.toString(16) + " ";
      };
      return '"' + c2.replace(/["\r\n\f]/g, h2) + '"';
    }, re.fromToken = function(c2) {
      return new re(c2.value, c2.startLine, c2.startCol);
    };
    var $2 = { __proto__: null, ":first-letter": 1, ":first-line": 1, ":before": 1, ":after": 1 };
    $2.ELEMENT = 1, $2.CLASS = 2, $2.isElement = function(c2) {
      return c2.indexOf("::") === 0 || $2[c2.toLowerCase()] === $2.ELEMENT;
    };
    function V(c2, h2, m) {
      l.call(this, c2.join(" "), h2, m, S.SELECTOR_TYPE), this.parts = c2, this.specificity = ie.calculate(this);
    }
    V.prototype = new l(), V.prototype.constructor = V;
    function ve(c2, h2, m, a, o) {
      l.call(this, m, a, o, S.SELECTOR_PART_TYPE), this.elementName = c2, this.modifiers = h2;
    }
    ve.prototype = new l(), ve.prototype.constructor = ve;
    function U(c2, h2, m, a) {
      l.call(this, c2, m, a, S.SELECTOR_SUB_PART_TYPE), this.type = h2, this.args = [];
    }
    U.prototype = new l(), U.prototype.constructor = U;
    function ie(c2, h2, m, a) {
      this.a = c2, this.b = h2, this.c = m, this.d = a;
    }
    ie.prototype = { constructor: ie, compare: function(c2) {
      var h2 = ["a", "b", "c", "d"], m, a;
      for (m = 0, a = h2.length; m < a; m++) {
        if (this[h2[m]] < c2[h2[m]])
          return -1;
        if (this[h2[m]] > c2[h2[m]])
          return 1;
      }
      return 0;
    }, valueOf: function() {
      return this.a * 1e3 + this.b * 100 + this.c * 10 + this.d;
    }, toString: function() {
      return this.a + "," + this.b + "," + this.c + "," + this.d;
    } }, ie.calculate = function(c2) {
      var h2, m, a, o = 0, u = 0, b2 = 0;
      function T(I) {
        var L, oe, We, dt, Pe = I.elementName ? I.elementName.text : "", kt;
        for (Pe && Pe.charAt(Pe.length - 1) !== "*" && b2++, L = 0, We = I.modifiers.length; L < We; L++)
          switch (kt = I.modifiers[L], kt.type) {
            case "class":
            case "attribute":
              u++;
              break;
            case "id":
              o++;
              break;
            case "pseudo":
              $2.isElement(kt.text) ? b2++ : u++;
              break;
            case "not":
              for (oe = 0, dt = kt.args.length; oe < dt; oe++)
                T(kt.args[oe]);
          }
      }
      for (h2 = 0, m = c2.parts.length; h2 < m; h2++)
        a = c2.parts[h2], a instanceof ve && T(a);
      return new ie(0, o, u, b2);
    };
    var be = /^[0-9a-fA-F]$/, ne = /\n|\r\n|\r|\f/;
    function qe(c2) {
      return c2 !== null && be.test(c2);
    }
    function He(c2) {
      return c2 !== null && /\d/.test(c2);
    }
    function Le(c2) {
      return c2 !== null && /\s/.test(c2);
    }
    function De(c2) {
      return c2 !== null && ne.test(c2);
    }
    function ft(c2) {
      return c2 !== null && /[a-z_\u0080-\uFFFF\\]/i.test(c2);
    }
    function k(c2) {
      return c2 !== null && (ft(c2) || /[0-9\-\\]/.test(c2));
    }
    function Fe(c2) {
      return c2 !== null && (ft(c2) || /\-\\/.test(c2));
    }
    function Ge(c2, h2) {
      for (var m in h2)
        Object.prototype.hasOwnProperty.call(h2, m) && (c2[m] = h2[m]);
      return c2;
    }
    function p(c2) {
      t.call(this, c2, d2);
    }
    p.prototype = Ge(new t(), { _getToken: function(c2) {
      var h2, m = this._reader, a = null, o = m.getLine(), u = m.getCol();
      for (h2 = m.read(); h2; ) {
        switch (h2) {
          case "/":
            m.peek() === "*" ? a = this.commentToken(h2, o, u) : a = this.charToken(h2, o, u);
            break;
          case "|":
          case "~":
          case "^":
          case "$":
          case "*":
            m.peek() === "=" ? a = this.comparisonToken(h2, o, u) : a = this.charToken(h2, o, u);
            break;
          case '"':
          case "'":
            a = this.stringToken(h2, o, u);
            break;
          case "#":
            k(m.peek()) ? a = this.hashToken(h2, o, u) : a = this.charToken(h2, o, u);
            break;
          case ".":
            He(m.peek()) ? a = this.numberToken(h2, o, u) : a = this.charToken(h2, o, u);
            break;
          case "-":
            m.peek() === "-" ? a = this.htmlCommentEndToken(h2, o, u) : ft(m.peek()) ? a = this.identOrFunctionToken(h2, o, u) : a = this.charToken(h2, o, u);
            break;
          case "!":
            a = this.importantToken(h2, o, u);
            break;
          case "@":
            a = this.atRuleToken(h2, o, u);
            break;
          case ":":
            a = this.notToken(h2, o, u);
            break;
          case "<":
            a = this.htmlCommentStartToken(h2, o, u);
            break;
          case "U":
          case "u":
            if (m.peek() === "+") {
              a = this.unicodeRangeToken(h2, o, u);
              break;
            }
          default:
            He(h2) ? a = this.numberToken(h2, o, u) : Le(h2) ? a = this.whitespaceToken(h2, o, u) : Fe(h2) ? a = this.identOrFunctionToken(h2, o, u) : a = this.charToken(h2, o, u);
        }
        break;
      }
      return !a && h2 === null && (a = this.createToken(d2.EOF, null, o, u)), a;
    }, createToken: function(c2, h2, m, a, o) {
      var u = this._reader;
      return o = o || {}, { value: h2, type: c2, channel: o.channel, endChar: o.endChar, hide: o.hide || false, startLine: m, startCol: a, endLine: u.getLine(), endCol: u.getCol() };
    }, atRuleToken: function(c2, h2, m) {
      var a = c2, o = this._reader, u = d2.CHAR, b2;
      return o.mark(), b2 = this.readName(), a = c2 + b2, u = d2.type(a.toLowerCase()), (u === d2.CHAR || u === d2.UNKNOWN) && (a.length > 1 ? u = d2.UNKNOWN_SYM : (u = d2.CHAR, a = c2, o.reset())), this.createToken(u, a, h2, m);
    }, charToken: function(c2, h2, m) {
      var a = d2.type(c2), o = {};
      return a === -1 ? a = d2.CHAR : o.endChar = d2[a].endChar, this.createToken(a, c2, h2, m, o);
    }, commentToken: function(c2, h2, m) {
      var a = this.readComment(c2);
      return this.createToken(d2.COMMENT, a, h2, m);
    }, comparisonToken: function(c2, h2, m) {
      var a = this._reader, o = c2 + a.read(), u = d2.type(o) || d2.CHAR;
      return this.createToken(u, o, h2, m);
    }, hashToken: function(c2, h2, m) {
      var a = this.readName(c2);
      return this.createToken(d2.HASH, a, h2, m);
    }, htmlCommentStartToken: function(c2, h2, m) {
      var a = this._reader, o = c2;
      return a.mark(), o += a.readCount(3), o === "<!--" ? this.createToken(d2.CDO, o, h2, m) : (a.reset(), this.charToken(c2, h2, m));
    }, htmlCommentEndToken: function(c2, h2, m) {
      var a = this._reader, o = c2;
      return a.mark(), o += a.readCount(2), o === "-->" ? this.createToken(d2.CDC, o, h2, m) : (a.reset(), this.charToken(c2, h2, m));
    }, identOrFunctionToken: function(c2, h2, m) {
      var a = this._reader, o = this.readName(c2), u = d2.IDENT, b2 = ["url(", "url-prefix(", "domain("];
      return a.peek() === "(" ? (o += a.read(), b2.indexOf(o.toLowerCase()) > -1 ? (u = d2.URI, o = this.readURI(o), b2.indexOf(o.toLowerCase()) > -1 && (u = d2.FUNCTION)) : u = d2.FUNCTION) : a.peek() === ":" && o.toLowerCase() === "progid" && (o += a.readTo("("), u = d2.IE_FUNCTION), this.createToken(u, o, h2, m);
    }, importantToken: function(c2, h2, m) {
      var a = this._reader, o = c2, u = d2.CHAR, b2, T;
      for (a.mark(), T = a.read(); T; ) {
        if (T === "/") {
          if (a.peek() !== "*")
            break;
          if (b2 = this.readComment(T), b2 === "")
            break;
        } else if (Le(T))
          o += T + this.readWhitespace();
        else if (/i/i.test(T)) {
          b2 = a.readCount(8), /mportant/i.test(b2) && (o += T + b2, u = d2.IMPORTANT_SYM);
          break;
        } else
          break;
        T = a.read();
      }
      return u === d2.CHAR ? (a.reset(), this.charToken(c2, h2, m)) : this.createToken(u, o, h2, m);
    }, notToken: function(c2, h2, m) {
      var a = this._reader, o = c2;
      return a.mark(), o += a.readCount(4), o.toLowerCase() === ":not(" ? this.createToken(d2.NOT, o, h2, m) : (a.reset(), this.charToken(c2, h2, m));
    }, numberToken: function(c2, h2, m) {
      var a = this._reader, o = this.readNumber(c2), u, b2 = d2.NUMBER, T = a.peek();
      return Fe(T) ? (u = this.readName(a.read()), o += u, /^em$|^ex$|^px$|^gd$|^rem$|^vw$|^vh$|^vmax$|^vmin$|^ch$|^cm$|^mm$|^in$|^pt$|^pc$/i.test(u) ? b2 = d2.LENGTH : /^deg|^rad$|^grad$/i.test(u) ? b2 = d2.ANGLE : /^ms$|^s$/i.test(u) ? b2 = d2.TIME : /^hz$|^khz$/i.test(u) ? b2 = d2.FREQ : /^dpi$|^dpcm$/i.test(u) ? b2 = d2.RESOLUTION : b2 = d2.DIMENSION) : T === "%" && (o += a.read(), b2 = d2.PERCENTAGE), this.createToken(b2, o, h2, m);
    }, stringToken: function(c2, h2, m) {
      for (var a = c2, o = c2, u = this._reader, b2 = c2, T = d2.STRING, I = u.read(); I && (o += I, !(I === a && b2 !== "\\")); ) {
        if (De(u.peek()) && I !== "\\") {
          T = d2.INVALID;
          break;
        }
        b2 = I, I = u.read();
      }
      return I === null && (T = d2.INVALID), this.createToken(T, o, h2, m);
    }, unicodeRangeToken: function(c2, h2, m) {
      var a = this._reader, o = c2, u, b2 = d2.CHAR;
      return a.peek() === "+" && (a.mark(), o += a.read(), o += this.readUnicodeRangePart(true), o.length === 2 ? a.reset() : (b2 = d2.UNICODE_RANGE, o.indexOf("?") === -1 && a.peek() === "-" && (a.mark(), u = a.read(), u += this.readUnicodeRangePart(false), u.length === 1 ? a.reset() : o += u))), this.createToken(b2, o, h2, m);
    }, whitespaceToken: function(c2, h2, m) {
      var a = c2 + this.readWhitespace();
      return this.createToken(d2.S, a, h2, m);
    }, readUnicodeRangePart: function(c2) {
      for (var h2 = this._reader, m = "", a = h2.peek(); qe(a) && m.length < 6; )
        h2.read(), m += a, a = h2.peek();
      if (c2)
        for (; a === "?" && m.length < 6; )
          h2.read(), m += a, a = h2.peek();
      return m;
    }, readWhitespace: function() {
      for (var c2 = this._reader, h2 = "", m = c2.peek(); Le(m); )
        c2.read(), h2 += m, m = c2.peek();
      return h2;
    }, readNumber: function(c2) {
      for (var h2 = this._reader, m = c2, a = c2 === ".", o = h2.peek(); o; ) {
        if (He(o))
          m += h2.read();
        else if (o === ".") {
          if (a)
            break;
          a = true, m += h2.read();
        } else
          break;
        o = h2.peek();
      }
      return m;
    }, readString: function() {
      for (var c2 = this._reader, h2 = c2.read(), m = h2, a = h2, o = c2.peek(); o && (o = c2.read(), m += o, !(o === h2 && a !== "\\")); ) {
        if (De(c2.peek()) && o !== "\\") {
          m = "";
          break;
        }
        a = o, o = c2.peek();
      }
      return o === null && (m = ""), m;
    }, readURI: function(c2) {
      var h2 = this._reader, m = c2, a = "", o = h2.peek();
      for (h2.mark(); o && Le(o); )
        h2.read(), o = h2.peek();
      for (o === "'" || o === '"' ? a = this.readString() : a = this.readURL(), o = h2.peek(); o && Le(o); )
        h2.read(), o = h2.peek();
      return a === "" || o !== ")" ? (m = c2, h2.reset()) : m += a + h2.read(), m;
    }, readURL: function() {
      for (var c2 = this._reader, h2 = "", m = c2.peek(); /^[!#$%&\\*-~]$/.test(m); )
        h2 += c2.read(), m = c2.peek();
      return h2;
    }, readName: function(c2) {
      for (var h2 = this._reader, m = c2 || "", a = h2.peek(); ; )
        if (a === "\\")
          m += this.readEscape(h2.read()), a = h2.peek();
        else if (a && k(a))
          m += h2.read(), a = h2.peek();
        else
          break;
      return m;
    }, readEscape: function(c2) {
      var h2 = this._reader, m = c2 || "", a = 0, o = h2.peek();
      if (qe(o))
        do
          m += h2.read(), o = h2.peek();
        while (o && qe(o) && ++a < 6);
      return m.length === 3 && /\s/.test(o) || m.length === 7 || m.length === 1 ? h2.read() : o = "", m + o;
    }, readComment: function(c2) {
      var h2 = this._reader, m = c2 || "", a = h2.read();
      if (a === "*") {
        for (; a; ) {
          if (m += a, m.length > 2 && a === "*" && h2.peek() === "/") {
            m += h2.read();
            break;
          }
          a = h2.read();
        }
        return m;
      } else
        return "";
    } });
    var d2 = [{ name: "CDO" }, { name: "CDC" }, { name: "S", whitespace: true }, { name: "COMMENT", comment: true, hide: true, channel: "comment" }, { name: "INCLUDES", text: "~=" }, { name: "DASHMATCH", text: "|=" }, { name: "PREFIXMATCH", text: "^=" }, { name: "SUFFIXMATCH", text: "$=" }, { name: "SUBSTRINGMATCH", text: "*=" }, { name: "STRING" }, { name: "IDENT" }, { name: "HASH" }, { name: "IMPORT_SYM", text: "@import" }, { name: "PAGE_SYM", text: "@page" }, { name: "MEDIA_SYM", text: "@media" }, { name: "FONT_FACE_SYM", text: "@font-face" }, { name: "CHARSET_SYM", text: "@charset" }, { name: "NAMESPACE_SYM", text: "@namespace" }, { name: "VIEWPORT_SYM", text: ["@viewport", "@-ms-viewport", "@-o-viewport"] }, { name: "DOCUMENT_SYM", text: ["@document", "@-moz-document"] }, { name: "UNKNOWN_SYM" }, { name: "KEYFRAMES_SYM", text: ["@keyframes", "@-webkit-keyframes", "@-moz-keyframes", "@-o-keyframes"] }, { name: "IMPORTANT_SYM" }, { name: "LENGTH" }, { name: "ANGLE" }, { name: "TIME" }, { name: "FREQ" }, { name: "DIMENSION" }, { name: "PERCENTAGE" }, { name: "NUMBER" }, { name: "URI" }, { name: "FUNCTION" }, { name: "UNICODE_RANGE" }, { name: "INVALID" }, { name: "PLUS", text: "+" }, { name: "GREATER", text: ">" }, { name: "COMMA", text: "," }, { name: "TILDE", text: "~" }, { name: "NOT" }, { name: "TOPLEFTCORNER_SYM", text: "@top-left-corner" }, { name: "TOPLEFT_SYM", text: "@top-left" }, { name: "TOPCENTER_SYM", text: "@top-center" }, { name: "TOPRIGHT_SYM", text: "@top-right" }, { name: "TOPRIGHTCORNER_SYM", text: "@top-right-corner" }, { name: "BOTTOMLEFTCORNER_SYM", text: "@bottom-left-corner" }, { name: "BOTTOMLEFT_SYM", text: "@bottom-left" }, { name: "BOTTOMCENTER_SYM", text: "@bottom-center" }, { name: "BOTTOMRIGHT_SYM", text: "@bottom-right" }, { name: "BOTTOMRIGHTCORNER_SYM", text: "@bottom-right-corner" }, { name: "LEFTTOP_SYM", text: "@left-top" }, { name: "LEFTMIDDLE_SYM", text: "@left-middle" }, { name: "LEFTBOTTOM_SYM", text: "@left-bottom" }, { name: "RIGHTTOP_SYM", text: "@right-top" }, { name: "RIGHTMIDDLE_SYM", text: "@right-middle" }, { name: "RIGHTBOTTOM_SYM", text: "@right-bottom" }, { name: "RESOLUTION", state: "media" }, { name: "IE_FUNCTION" }, { name: "CHAR" }, { name: "PIPE", text: "|" }, { name: "SLASH", text: "/" }, { name: "MINUS", text: "-" }, { name: "STAR", text: "*" }, { name: "LBRACE", endChar: "}", text: "{" }, { name: "RBRACE", text: "}" }, { name: "LBRACKET", endChar: "]", text: "[" }, { name: "RBRACKET", text: "]" }, { name: "EQUALS", text: "=" }, { name: "COLON", text: ":" }, { name: "SEMICOLON", text: ";" }, { name: "LPAREN", endChar: ")", text: "(" }, { name: "RPAREN", text: ")" }, { name: "DOT", text: "." }];
    (function() {
      var c2 = [], h2 = /* @__PURE__ */ Object.create(null);
      d2.UNKNOWN = -1, d2.unshift({ name: "EOF" });
      for (var m = 0, a = d2.length; m < a; m++)
        if (c2.push(d2[m].name), d2[d2[m].name] = m, d2[m].text)
          if (d2[m].text instanceof Array)
            for (var o = 0; o < d2[m].text.length; o++)
              h2[d2[m].text[o]] = m;
          else
            h2[d2[m].text] = m;
      d2.name = function(u) {
        return c2[u];
      }, d2.type = function(u) {
        return h2[u] || -1;
      };
    })();
    var Xe = { validate: function(c2, h2) {
      var m = c2.toString().toLowerCase(), a = new g2(h2), o = D[m];
      if (o)
        typeof o != "number" && (typeof o == "string" ? o.indexOf("||") > -1 ? this.groupProperty(o, a) : this.singleProperty(o, a, 1) : o.multi ? this.multiProperty(o.multi, a, o.comma, o.max || 1 / 0) : typeof o == "function" && o(a));
      else if (m.indexOf("-") !== 0)
        throw new se("Unknown property '" + c2 + "'.", c2.line, c2.col);
    }, singleProperty: function(c2, h2, m, a) {
      for (var o = false, u = h2.value, b2 = 0, T; h2.hasNext() && b2 < m && (o = A.isAny(h2, c2), !!o); )
        b2++;
      if (o) {
        if (h2.hasNext())
          throw T = h2.next(), new se("Expected end of value but found '" + T + "'.", T.line, T.col);
      } else
        throw h2.hasNext() && !h2.isFirst() ? (T = h2.peek(), new se("Expected end of value but found '" + T + "'.", T.line, T.col)) : new se("Expected (" + c2 + ") but found '" + u + "'.", u.line, u.col);
    }, multiProperty: function(c2, h2, m, a) {
      for (var o = false, u = h2.value, b2 = 0, T; h2.hasNext() && !o && b2 < a && A.isAny(h2, c2); )
        if (b2++, !h2.hasNext())
          o = true;
        else if (m)
          if (String(h2.peek()) === ",")
            T = h2.next();
          else
            break;
      if (o) {
        if (h2.hasNext())
          throw T = h2.next(), new se("Expected end of value but found '" + T + "'.", T.line, T.col);
      } else
        throw h2.hasNext() && !h2.isFirst() ? (T = h2.peek(), new se("Expected end of value but found '" + T + "'.", T.line, T.col)) : (T = h2.previous(), m && String(T) === "," ? new se("Expected end of value but found '" + T + "'.", T.line, T.col) : new se("Expected (" + c2 + ") but found '" + u + "'.", u.line, u.col));
    }, groupProperty: function(c2, h2, m) {
      for (var a = false, o = h2.value, u = c2.split("||").length, b2 = { count: 0 }, T = false, I, L; h2.hasNext() && !a && (I = A.isAnyOfGroup(h2, c2), I); ) {
        if (b2[I])
          break;
        b2[I] = 1, b2.count++, T = true, (b2.count === u || !h2.hasNext()) && (a = true);
      }
      if (a) {
        if (h2.hasNext())
          throw L = h2.next(), new se("Expected end of value but found '" + L + "'.", L.line, L.col);
      } else
        throw T && h2.hasNext() ? (L = h2.peek(), new se("Expected end of value but found '" + L + "'.", L.line, L.col)) : new se("Expected (" + c2 + ") but found '" + o + "'.", o.line, o.col);
    } };
    function se(c2, h2, m) {
      this.col = m, this.line = h2, this.message = c2;
    }
    se.prototype = new Error();
    var A = { isLiteral: function(c2, h2) {
      var m = c2.text.toString().toLowerCase(), a = h2.split(" | "), o, u, b2 = false;
      for (o = 0, u = a.length; o < u && !b2; o++)
        m === a[o].toLowerCase() && (b2 = true);
      return b2;
    }, isSimple: function(c2) {
      return !!this.simple[c2];
    }, isComplex: function(c2) {
      return !!this.complex[c2];
    }, isAny: function(c2, h2) {
      var m = h2.split(" | "), a, o, u = false;
      for (a = 0, o = m.length; a < o && !u && c2.hasNext(); a++)
        u = this.isType(c2, m[a]);
      return u;
    }, isAnyOfGroup: function(c2, h2) {
      var m = h2.split(" || "), a, o, u = false;
      for (a = 0, o = m.length; a < o && !u; a++)
        u = this.isType(c2, m[a]);
      return u ? m[a - 1] : false;
    }, isType: function(c2, h2) {
      var m = c2.peek(), a = false;
      return h2.charAt(0) !== "<" ? (a = this.isLiteral(m, h2), a && c2.next()) : this.simple[h2] ? (a = this.simple[h2](m), a && c2.next()) : a = this.complex[h2](c2), a;
    }, simple: { __proto__: null, "<absolute-size>": function(c2) {
      return A.isLiteral(c2, "xx-small | x-small | small | medium | large | x-large | xx-large");
    }, "<attachment>": function(c2) {
      return A.isLiteral(c2, "scroll | fixed | local");
    }, "<attr>": function(c2) {
      return c2.type === "function" && c2.name === "attr";
    }, "<bg-image>": function(c2) {
      return this["<image>"](c2) || this["<gradient>"](c2) || String(c2) === "none";
    }, "<gradient>": function(c2) {
      return c2.type === "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?(?:repeating\-)?(?:radial\-|linear\-)?gradient/i.test(c2);
    }, "<box>": function(c2) {
      return A.isLiteral(c2, "padding-box | border-box | content-box");
    }, "<content>": function(c2) {
      return c2.type === "function" && c2.name === "content";
    }, "<relative-size>": function(c2) {
      return A.isLiteral(c2, "smaller | larger");
    }, "<ident>": function(c2) {
      return c2.type === "identifier";
    }, "<length>": function(c2) {
      return c2.type === "function" && /^(?:\-(?:ms|moz|o|webkit)\-)?calc/i.test(c2) ? true : c2.type === "length" || c2.type === "number" || c2.type === "integer" || String(c2) === "0";
    }, "<color>": function(c2) {
      return c2.type === "color" || String(c2) === "transparent" || String(c2) === "currentColor";
    }, "<number>": function(c2) {
      return c2.type === "number" || this["<integer>"](c2);
    }, "<integer>": function(c2) {
      return c2.type === "integer";
    }, "<line>": function(c2) {
      return c2.type === "integer";
    }, "<angle>": function(c2) {
      return c2.type === "angle";
    }, "<uri>": function(c2) {
      return c2.type === "uri";
    }, "<image>": function(c2) {
      return this["<uri>"](c2);
    }, "<percentage>": function(c2) {
      return c2.type === "percentage" || String(c2) === "0";
    }, "<border-width>": function(c2) {
      return this["<length>"](c2) || A.isLiteral(c2, "thin | medium | thick");
    }, "<border-style>": function(c2) {
      return A.isLiteral(c2, "none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset");
    }, "<content-sizing>": function(c2) {
      return A.isLiteral(c2, "fill-available | -moz-available | -webkit-fill-available | max-content | -moz-max-content | -webkit-max-content | min-content | -moz-min-content | -webkit-min-content | fit-content | -moz-fit-content | -webkit-fit-content");
    }, "<margin-width>": function(c2) {
      return this["<length>"](c2) || this["<percentage>"](c2) || A.isLiteral(c2, "auto");
    }, "<padding-width>": function(c2) {
      return this["<length>"](c2) || this["<percentage>"](c2);
    }, "<shape>": function(c2) {
      return c2.type === "function" && (c2.name === "rect" || c2.name === "inset-rect");
    }, "<time>": function(c2) {
      return c2.type === "time";
    }, "<flex-grow>": function(c2) {
      return this["<number>"](c2);
    }, "<flex-shrink>": function(c2) {
      return this["<number>"](c2);
    }, "<width>": function(c2) {
      return this["<margin-width>"](c2);
    }, "<flex-basis>": function(c2) {
      return this["<width>"](c2);
    }, "<flex-direction>": function(c2) {
      return A.isLiteral(c2, "row | row-reverse | column | column-reverse");
    }, "<flex-wrap>": function(c2) {
      return A.isLiteral(c2, "nowrap | wrap | wrap-reverse");
    }, "<feature-tag-value>": function(c2) {
      return c2.type === "function" && /^[A-Z0-9]{4}$/i.test(c2);
    } }, complex: { __proto__: null, "<bg-position>": function(c2) {
      for (var h2 = false, m = "<percentage> | <length>", a = "left | right", o = "top | bottom", u = 0; c2.peek(u) && c2.peek(u).text !== ","; )
        u++;
      return u < 3 ? A.isAny(c2, a + " | center | " + m) ? (h2 = true, A.isAny(c2, o + " | center | " + m)) : A.isAny(c2, o) && (h2 = true, A.isAny(c2, a + " | center")) : A.isAny(c2, a) ? A.isAny(c2, o) ? (h2 = true, A.isAny(c2, m)) : A.isAny(c2, m) && (A.isAny(c2, o) ? (h2 = true, A.isAny(c2, m)) : A.isAny(c2, "center") && (h2 = true)) : A.isAny(c2, o) ? A.isAny(c2, a) ? (h2 = true, A.isAny(c2, m)) : A.isAny(c2, m) && (A.isAny(c2, a) ? (h2 = true, A.isAny(c2, m)) : A.isAny(c2, "center") && (h2 = true)) : A.isAny(c2, "center") && A.isAny(c2, a + " | " + o) && (h2 = true, A.isAny(c2, m)), h2;
    }, "<bg-size>": function(c2) {
      var h2 = false, m = "<percentage> | <length> | auto";
      return A.isAny(c2, "cover | contain") ? h2 = true : A.isAny(c2, m) && (h2 = true, A.isAny(c2, m)), h2;
    }, "<repeat-style>": function(c2) {
      var h2 = false, m = "repeat | space | round | no-repeat", a;
      return c2.hasNext() && (a = c2.next(), A.isLiteral(a, "repeat-x | repeat-y") ? h2 = true : A.isLiteral(a, m) && (h2 = true, c2.hasNext() && A.isLiteral(c2.peek(), m) && c2.next())), h2;
    }, "<shadow>": function(c2) {
      var h2 = false, m = 0, a = false, o = false;
      if (c2.hasNext()) {
        for (A.isAny(c2, "inset") && (a = true), A.isAny(c2, "<color>") && (o = true); A.isAny(c2, "<length>") && m < 4; )
          m++;
        c2.hasNext() && (o || A.isAny(c2, "<color>"), a || A.isAny(c2, "inset")), h2 = m >= 2 && m <= 4;
      }
      return h2;
    }, "<x-one-radius>": function(c2) {
      var h2 = false, m = "<length> | <percentage> | inherit";
      return A.isAny(c2, m) && (h2 = true, A.isAny(c2, m)), h2;
    }, "<flex>": function(c2) {
      var h2, m = false;
      if (A.isAny(c2, "none | inherit") ? m = true : A.isType(c2, "<flex-grow>") ? c2.peek() ? A.isType(c2, "<flex-shrink>") ? c2.peek() ? m = A.isType(c2, "<flex-basis>") : m = true : A.isType(c2, "<flex-basis>") && (m = c2.peek() === null) : m = true : A.isType(c2, "<flex-basis>") && (m = true), !m)
        throw h2 = c2.peek(), new se("Expected (none | [ <flex-grow> <flex-shrink>? || <flex-basis> ]) but found '" + c2.value.text + "'.", h2.line, h2.col);
      return m;
    } } };
    ct.css = { __proto__: null, Colors: f2, Combinator: _, Parser: S, PropertyName: ae, PropertyValue: ce, PropertyValuePart: re, MediaFeature: y, MediaQuery: w, Selector: V, SelectorPart: ve, SelectorSubPart: U, Specificity: ie, TokenStream: p, Tokens: d2, ValidationError: se };
  })();
  (function() {
    for (var e2 in ct)
      mo[e2] = ct[e2];
  })();
});
var pn = O((Zf, vo) => {
  var a0 = go();
  vo.exports = vr;
  function vr(e2) {
    this._element = e2;
  }
  function bo(e2) {
    var t = new a0.css.Parser(), r = { property: /* @__PURE__ */ Object.create(null), priority: /* @__PURE__ */ Object.create(null) };
    return t.addListener("property", function(n) {
      n.invalid || (r.property[n.property.text] = n.value.text, n.important && (r.priority[n.property.text] = "important"));
    }), e2 = ("" + e2).replace(/^;/, ""), t.parseStyleAttribute(e2), r;
  }
  var Xt = {};
  vr.prototype = Object.create(Object.prototype, { _parsed: { get: function() {
    if (!this._parsedStyles || this.cssText !== this._lastParsedText) {
      var e2 = this.cssText;
      this._parsedStyles = bo(e2), this._lastParsedText = e2, delete this._names;
    }
    return this._parsedStyles;
  } }, _serialize: { value: function() {
    var e2 = this._parsed, t = "";
    for (var r in e2.property)
      t && (t += " "), t += r + ": " + e2.property[r], e2.priority[r] && (t += " !" + e2.priority[r]), t += ";";
    this.cssText = t, this._lastParsedText = t, delete this._names;
  } }, cssText: { get: function() {
    return this._element.getAttribute("style");
  }, set: function(e2) {
    this._element.setAttribute("style", e2);
  } }, length: { get: function() {
    return this._names || (this._names = Object.getOwnPropertyNames(this._parsed.property)), this._names.length;
  } }, item: { value: function(e2) {
    return this._names || (this._names = Object.getOwnPropertyNames(this._parsed.property)), this._names[e2];
  } }, getPropertyValue: { value: function(e2) {
    return e2 = e2.toLowerCase(), this._parsed.property[e2] || "";
  } }, getPropertyPriority: { value: function(e2) {
    return e2 = e2.toLowerCase(), this._parsed.priority[e2] || "";
  } }, setProperty: { value: function(e2, t, r) {
    if (e2 = e2.toLowerCase(), t == null && (t = ""), r == null && (r = ""), t !== Xt && (t = "" + t), t === "") {
      this.removeProperty(e2);
      return;
    }
    if (!(r !== "" && r !== Xt && !/^important$/i.test(r))) {
      var n = this._parsed;
      if (t === Xt) {
        if (!n.property[e2])
          return;
        r !== "" ? n.priority[e2] = "important" : delete n.priority[e2];
      } else {
        if (t.indexOf(";") !== -1)
          return;
        var l = bo(e2 + ":" + t);
        if (Object.getOwnPropertyNames(l.property).length === 0 || Object.getOwnPropertyNames(l.priority).length !== 0)
          return;
        for (var f2 in l.property)
          n.property[f2] = l.property[f2], r !== Xt && (r !== "" ? n.priority[f2] = "important" : n.priority[f2] && delete n.priority[f2]);
      }
      this._serialize();
    }
  } }, setPropertyValue: { value: function(e2, t) {
    return this.setProperty(e2, t, Xt);
  } }, setPropertyPriority: { value: function(e2, t) {
    return this.setProperty(e2, Xt, t);
  } }, removeProperty: { value: function(e2) {
    e2 = e2.toLowerCase();
    var t = this._parsed;
    e2 in t.property && (delete t.property[e2], delete t.priority[e2], this._serialize());
  } } });
  var Eo = { alignContent: "align-content", alignItems: "align-items", alignmentBaseline: "alignment-baseline", alignSelf: "align-self", animation: "animation", animationDelay: "animation-delay", animationDirection: "animation-direction", animationDuration: "animation-duration", animationFillMode: "animation-fill-mode", animationIterationCount: "animation-iteration-count", animationName: "animation-name", animationPlayState: "animation-play-state", animationTimingFunction: "animation-timing-function", backfaceVisibility: "backface-visibility", background: "background", backgroundAttachment: "background-attachment", backgroundClip: "background-clip", backgroundColor: "background-color", backgroundImage: "background-image", backgroundOrigin: "background-origin", backgroundPosition: "background-position", backgroundPositionX: "background-position-x", backgroundPositionY: "background-position-y", backgroundRepeat: "background-repeat", backgroundSize: "background-size", baselineShift: "baseline-shift", border: "border", borderBottom: "border-bottom", borderBottomColor: "border-bottom-color", borderBottomLeftRadius: "border-bottom-left-radius", borderBottomRightRadius: "border-bottom-right-radius", borderBottomStyle: "border-bottom-style", borderBottomWidth: "border-bottom-width", borderCollapse: "border-collapse", borderColor: "border-color", borderImage: "border-image", borderImageOutset: "border-image-outset", borderImageRepeat: "border-image-repeat", borderImageSlice: "border-image-slice", borderImageSource: "border-image-source", borderImageWidth: "border-image-width", borderLeft: "border-left", borderLeftColor: "border-left-color", borderLeftStyle: "border-left-style", borderLeftWidth: "border-left-width", borderRadius: "border-radius", borderRight: "border-right", borderRightColor: "border-right-color", borderRightStyle: "border-right-style", borderRightWidth: "border-right-width", borderSpacing: "border-spacing", borderStyle: "border-style", borderTop: "border-top", borderTopColor: "border-top-color", borderTopLeftRadius: "border-top-left-radius", borderTopRightRadius: "border-top-right-radius", borderTopStyle: "border-top-style", borderTopWidth: "border-top-width", borderWidth: "border-width", bottom: "bottom", boxShadow: "box-shadow", boxSizing: "box-sizing", breakAfter: "break-after", breakBefore: "break-before", breakInside: "break-inside", captionSide: "caption-side", clear: "clear", clip: "clip", clipPath: "clip-path", clipRule: "clip-rule", color: "color", colorInterpolationFilters: "color-interpolation-filters", columnCount: "column-count", columnFill: "column-fill", columnGap: "column-gap", columnRule: "column-rule", columnRuleColor: "column-rule-color", columnRuleStyle: "column-rule-style", columnRuleWidth: "column-rule-width", columns: "columns", columnSpan: "column-span", columnWidth: "column-width", content: "content", counterIncrement: "counter-increment", counterReset: "counter-reset", cssFloat: "float", cursor: "cursor", direction: "direction", display: "display", dominantBaseline: "dominant-baseline", emptyCells: "empty-cells", enableBackground: "enable-background", fill: "fill", fillOpacity: "fill-opacity", fillRule: "fill-rule", filter: "filter", flex: "flex", flexBasis: "flex-basis", flexDirection: "flex-direction", flexFlow: "flex-flow", flexGrow: "flex-grow", flexShrink: "flex-shrink", flexWrap: "flex-wrap", floodColor: "flood-color", floodOpacity: "flood-opacity", font: "font", fontFamily: "font-family", fontFeatureSettings: "font-feature-settings", fontSize: "font-size", fontSizeAdjust: "font-size-adjust", fontStretch: "font-stretch", fontStyle: "font-style", fontVariant: "font-variant", fontWeight: "font-weight", glyphOrientationHorizontal: "glyph-orientation-horizontal", glyphOrientationVertical: "glyph-orientation-vertical", grid: "grid", gridArea: "grid-area", gridAutoColumns: "grid-auto-columns", gridAutoFlow: "grid-auto-flow", gridAutoRows: "grid-auto-rows", gridColumn: "grid-column", gridColumnEnd: "grid-column-end", gridColumnGap: "grid-column-gap", gridColumnStart: "grid-column-start", gridGap: "grid-gap", gridRow: "grid-row", gridRowEnd: "grid-row-end", gridRowGap: "grid-row-gap", gridRowStart: "grid-row-start", gridTemplate: "grid-template", gridTemplateAreas: "grid-template-areas", gridTemplateColumns: "grid-template-columns", gridTemplateRows: "grid-template-rows", height: "height", imeMode: "ime-mode", justifyContent: "justify-content", kerning: "kerning", layoutGrid: "layout-grid", layoutGridChar: "layout-grid-char", layoutGridLine: "layout-grid-line", layoutGridMode: "layout-grid-mode", layoutGridType: "layout-grid-type", left: "left", letterSpacing: "letter-spacing", lightingColor: "lighting-color", lineBreak: "line-break", lineHeight: "line-height", listStyle: "list-style", listStyleImage: "list-style-image", listStylePosition: "list-style-position", listStyleType: "list-style-type", margin: "margin", marginBottom: "margin-bottom", marginLeft: "margin-left", marginRight: "margin-right", marginTop: "margin-top", marker: "marker", markerEnd: "marker-end", markerMid: "marker-mid", markerStart: "marker-start", mask: "mask", maxHeight: "max-height", maxWidth: "max-width", minHeight: "min-height", minWidth: "min-width", msContentZoomChaining: "-ms-content-zoom-chaining", msContentZooming: "-ms-content-zooming", msContentZoomLimit: "-ms-content-zoom-limit", msContentZoomLimitMax: "-ms-content-zoom-limit-max", msContentZoomLimitMin: "-ms-content-zoom-limit-min", msContentZoomSnap: "-ms-content-zoom-snap", msContentZoomSnapPoints: "-ms-content-zoom-snap-points", msContentZoomSnapType: "-ms-content-zoom-snap-type", msFlowFrom: "-ms-flow-from", msFlowInto: "-ms-flow-into", msFontFeatureSettings: "-ms-font-feature-settings", msGridColumn: "-ms-grid-column", msGridColumnAlign: "-ms-grid-column-align", msGridColumns: "-ms-grid-columns", msGridColumnSpan: "-ms-grid-column-span", msGridRow: "-ms-grid-row", msGridRowAlign: "-ms-grid-row-align", msGridRows: "-ms-grid-rows", msGridRowSpan: "-ms-grid-row-span", msHighContrastAdjust: "-ms-high-contrast-adjust", msHyphenateLimitChars: "-ms-hyphenate-limit-chars", msHyphenateLimitLines: "-ms-hyphenate-limit-lines", msHyphenateLimitZone: "-ms-hyphenate-limit-zone", msHyphens: "-ms-hyphens", msImeAlign: "-ms-ime-align", msOverflowStyle: "-ms-overflow-style", msScrollChaining: "-ms-scroll-chaining", msScrollLimit: "-ms-scroll-limit", msScrollLimitXMax: "-ms-scroll-limit-x-max", msScrollLimitXMin: "-ms-scroll-limit-x-min", msScrollLimitYMax: "-ms-scroll-limit-y-max", msScrollLimitYMin: "-ms-scroll-limit-y-min", msScrollRails: "-ms-scroll-rails", msScrollSnapPointsX: "-ms-scroll-snap-points-x", msScrollSnapPointsY: "-ms-scroll-snap-points-y", msScrollSnapType: "-ms-scroll-snap-type", msScrollSnapX: "-ms-scroll-snap-x", msScrollSnapY: "-ms-scroll-snap-y", msScrollTranslation: "-ms-scroll-translation", msTextCombineHorizontal: "-ms-text-combine-horizontal", msTextSizeAdjust: "-ms-text-size-adjust", msTouchAction: "-ms-touch-action", msTouchSelect: "-ms-touch-select", msUserSelect: "-ms-user-select", msWrapFlow: "-ms-wrap-flow", msWrapMargin: "-ms-wrap-margin", msWrapThrough: "-ms-wrap-through", opacity: "opacity", order: "order", orphans: "orphans", outline: "outline", outlineColor: "outline-color", outlineOffset: "outline-offset", outlineStyle: "outline-style", outlineWidth: "outline-width", overflow: "overflow", overflowX: "overflow-x", overflowY: "overflow-y", padding: "padding", paddingBottom: "padding-bottom", paddingLeft: "padding-left", paddingRight: "padding-right", paddingTop: "padding-top", page: "page", pageBreakAfter: "page-break-after", pageBreakBefore: "page-break-before", pageBreakInside: "page-break-inside", perspective: "perspective", perspectiveOrigin: "perspective-origin", pointerEvents: "pointer-events", position: "position", quotes: "quotes", right: "right", rotate: "rotate", rubyAlign: "ruby-align", rubyOverhang: "ruby-overhang", rubyPosition: "ruby-position", scale: "scale", size: "size", stopColor: "stop-color", stopOpacity: "stop-opacity", stroke: "stroke", strokeDasharray: "stroke-dasharray", strokeDashoffset: "stroke-dashoffset", strokeLinecap: "stroke-linecap", strokeLinejoin: "stroke-linejoin", strokeMiterlimit: "stroke-miterlimit", strokeOpacity: "stroke-opacity", strokeWidth: "stroke-width", tableLayout: "table-layout", textAlign: "text-align", textAlignLast: "text-align-last", textAnchor: "text-anchor", textDecoration: "text-decoration", textIndent: "text-indent", textJustify: "text-justify", textKashida: "text-kashida", textKashidaSpace: "text-kashida-space", textOverflow: "text-overflow", textShadow: "text-shadow", textTransform: "text-transform", textUnderlinePosition: "text-underline-position", top: "top", touchAction: "touch-action", transform: "transform", transformOrigin: "transform-origin", transformStyle: "transform-style", transition: "transition", transitionDelay: "transition-delay", transitionDuration: "transition-duration", transitionProperty: "transition-property", transitionTimingFunction: "transition-timing-function", translate: "translate", unicodeBidi: "unicode-bidi", verticalAlign: "vertical-align", visibility: "visibility", webkitAlignContent: "-webkit-align-content", webkitAlignItems: "-webkit-align-items", webkitAlignSelf: "-webkit-align-self", webkitAnimation: "-webkit-animation", webkitAnimationDelay: "-webkit-animation-delay", webkitAnimationDirection: "-webkit-animation-direction", webkitAnimationDuration: "-webkit-animation-duration", webkitAnimationFillMode: "-webkit-animation-fill-mode", webkitAnimationIterationCount: "-webkit-animation-iteration-count", webkitAnimationName: "-webkit-animation-name", webkitAnimationPlayState: "-webkit-animation-play-state", webkitAnimationTimingFunction: "-webkit-animation-timing-funciton", webkitAppearance: "-webkit-appearance", webkitBackfaceVisibility: "-webkit-backface-visibility", webkitBackgroundClip: "-webkit-background-clip", webkitBackgroundOrigin: "-webkit-background-origin", webkitBackgroundSize: "-webkit-background-size", webkitBorderBottomLeftRadius: "-webkit-border-bottom-left-radius", webkitBorderBottomRightRadius: "-webkit-border-bottom-right-radius", webkitBorderImage: "-webkit-border-image", webkitBorderRadius: "-webkit-border-radius", webkitBorderTopLeftRadius: "-webkit-border-top-left-radius", webkitBorderTopRightRadius: "-webkit-border-top-right-radius", webkitBoxAlign: "-webkit-box-align", webkitBoxDirection: "-webkit-box-direction", webkitBoxFlex: "-webkit-box-flex", webkitBoxOrdinalGroup: "-webkit-box-ordinal-group", webkitBoxOrient: "-webkit-box-orient", webkitBoxPack: "-webkit-box-pack", webkitBoxSizing: "-webkit-box-sizing", webkitColumnBreakAfter: "-webkit-column-break-after", webkitColumnBreakBefore: "-webkit-column-break-before", webkitColumnBreakInside: "-webkit-column-break-inside", webkitColumnCount: "-webkit-column-count", webkitColumnGap: "-webkit-column-gap", webkitColumnRule: "-webkit-column-rule", webkitColumnRuleColor: "-webkit-column-rule-color", webkitColumnRuleStyle: "-webkit-column-rule-style", webkitColumnRuleWidth: "-webkit-column-rule-width", webkitColumns: "-webkit-columns", webkitColumnSpan: "-webkit-column-span", webkitColumnWidth: "-webkit-column-width", webkitFilter: "-webkit-filter", webkitFlex: "-webkit-flex", webkitFlexBasis: "-webkit-flex-basis", webkitFlexDirection: "-webkit-flex-direction", webkitFlexFlow: "-webkit-flex-flow", webkitFlexGrow: "-webkit-flex-grow", webkitFlexShrink: "-webkit-flex-shrink", webkitFlexWrap: "-webkit-flex-wrap", webkitJustifyContent: "-webkit-justify-content", webkitOrder: "-webkit-order", webkitPerspective: "-webkit-perspective-origin", webkitPerspectiveOrigin: "-webkit-perspective-origin", webkitTapHighlightColor: "-webkit-tap-highlight-color", webkitTextFillColor: "-webkit-text-fill-color", webkitTextSizeAdjust: "-webkit-text-size-adjust", webkitTextStroke: "-webkit-text-stroke", webkitTextStrokeColor: "-webkit-text-stroke-color", webkitTextStrokeWidth: "-webkit-text-stroke-width", webkitTransform: "-webkit-transform", webkitTransformOrigin: "-webkit-transform-origin", webkitTransformStyle: "-webkit-transform-style", webkitTransition: "-webkit-transition", webkitTransitionDelay: "-webkit-transition-delay", webkitTransitionDuration: "-webkit-transition-duration", webkitTransitionProperty: "-webkit-transition-property", webkitTransitionTimingFunction: "-webkit-transition-timing-function", webkitUserModify: "-webkit-user-modify", webkitUserSelect: "-webkit-user-select", webkitWritingMode: "-webkit-writing-mode", whiteSpace: "white-space", widows: "widows", width: "width", wordBreak: "word-break", wordSpacing: "word-spacing", wordWrap: "word-wrap", writingMode: "writing-mode", zIndex: "z-index", zoom: "zoom", resize: "resize", userSelect: "user-select" };
  for (_o in Eo)
    i0(_o);
  var _o;
  function i0(e2) {
    var t = Eo[e2];
    Object.defineProperty(vr.prototype, e2, { get: function() {
      return this.getPropertyValue(t);
    }, set: function(r) {
      this.setProperty(t, r);
    } }), vr.prototype.hasOwnProperty(t) || Object.defineProperty(vr.prototype, t, { get: function() {
      return this.getPropertyValue(t);
    }, set: function(r) {
      this.setProperty(t, r);
    } });
  }
});
var $a = O((Jf, yo) => {
  var Ee = xn();
  yo.exports = yr;
  function yr() {
  }
  yr.prototype = Object.create(Object.prototype, { _url: { get: function() {
    return new Ee(this.href);
  } }, protocol: { get: function() {
    var e2 = this._url;
    return e2 && e2.scheme ? e2.scheme + ":" : ":";
  }, set: function(e2) {
    var t = this.href, r = new Ee(t);
    r.isAbsolute() && (e2 = e2.replace(/:+$/, ""), e2 = e2.replace(/[^-+\.a-zA-Z0-9]/g, Ee.percentEncode), e2.length > 0 && (r.scheme = e2, t = r.toString())), this.href = t;
  } }, host: { get: function() {
    var e2 = this._url;
    return e2.isAbsolute() && e2.isAuthorityBased() ? e2.host + (e2.port ? ":" + e2.port : "") : "";
  }, set: function(e2) {
    var t = this.href, r = new Ee(t);
    r.isAbsolute() && r.isAuthorityBased() && (e2 = e2.replace(/[^-+\._~!$&'()*,;:=a-zA-Z0-9]/g, Ee.percentEncode), e2.length > 0 && (r.host = e2, delete r.port, t = r.toString())), this.href = t;
  } }, hostname: { get: function() {
    var e2 = this._url;
    return e2.isAbsolute() && e2.isAuthorityBased() ? e2.host : "";
  }, set: function(e2) {
    var t = this.href, r = new Ee(t);
    r.isAbsolute() && r.isAuthorityBased() && (e2 = e2.replace(/^\/+/, ""), e2 = e2.replace(/[^-+\._~!$&'()*,;:=a-zA-Z0-9]/g, Ee.percentEncode), e2.length > 0 && (r.host = e2, t = r.toString())), this.href = t;
  } }, port: { get: function() {
    var e2 = this._url;
    return e2.isAbsolute() && e2.isAuthorityBased() && e2.port !== void 0 ? e2.port : "";
  }, set: function(e2) {
    var t = this.href, r = new Ee(t);
    r.isAbsolute() && r.isAuthorityBased() && (e2 = "" + e2, e2 = e2.replace(/[^0-9].*$/, ""), e2 = e2.replace(/^0+/, ""), e2.length === 0 && (e2 = "0"), parseInt(e2, 10) <= 65535 && (r.port = e2, t = r.toString())), this.href = t;
  } }, pathname: { get: function() {
    var e2 = this._url;
    return e2.isAbsolute() && e2.isHierarchical() ? e2.path : "";
  }, set: function(e2) {
    var t = this.href, r = new Ee(t);
    r.isAbsolute() && r.isHierarchical() && (e2.charAt(0) !== "/" && (e2 = "/" + e2), e2 = e2.replace(/[^-+\._~!$&'()*,;:=@\/a-zA-Z0-9]/g, Ee.percentEncode), r.path = e2, t = r.toString()), this.href = t;
  } }, search: { get: function() {
    var e2 = this._url;
    return e2.isAbsolute() && e2.isHierarchical() && e2.query !== void 0 ? "?" + e2.query : "";
  }, set: function(e2) {
    var t = this.href, r = new Ee(t);
    r.isAbsolute() && r.isHierarchical() && (e2.charAt(0) === "?" && (e2 = e2.substring(1)), e2 = e2.replace(/[^-+\._~!$&'()*,;:=@\/?a-zA-Z0-9]/g, Ee.percentEncode), r.query = e2, t = r.toString()), this.href = t;
  } }, hash: { get: function() {
    var e2 = this._url;
    return e2 == null || e2.fragment == null || e2.fragment === "" ? "" : "#" + e2.fragment;
  }, set: function(e2) {
    var t = this.href, r = new Ee(t);
    e2.charAt(0) === "#" && (e2 = e2.substring(1)), e2 = e2.replace(/[^-+\._~!$&'()*,;:=@\/?a-zA-Z0-9]/g, Ee.percentEncode), r.fragment = e2, t = r.toString(), this.href = t;
  } }, username: { get: function() {
    var e2 = this._url;
    return e2.username || "";
  }, set: function(e2) {
    var t = this.href, r = new Ee(t);
    r.isAbsolute() && (e2 = e2.replace(/[\x00-\x1F\x7F-\uFFFF "#<>?`\/@\\:]/g, Ee.percentEncode), r.username = e2, t = r.toString()), this.href = t;
  } }, password: { get: function() {
    var e2 = this._url;
    return e2.password || "";
  }, set: function(e2) {
    var t = this.href, r = new Ee(t);
    r.isAbsolute() && (e2 === "" ? r.password = null : (e2 = e2.replace(/[\x00-\x1F\x7F-\uFFFF "#<>?`\/@\\]/g, Ee.percentEncode), r.password = e2), t = r.toString()), this.href = t;
  } }, origin: { get: function() {
    var e2 = this._url;
    if (e2 == null)
      return "";
    var t = function(r) {
      var n = [e2.scheme, e2.host, +e2.port || r];
      return n[0] + "://" + n[1] + (n[2] === r ? "" : ":" + n[2]);
    };
    switch (e2.scheme) {
      case "ftp":
        return t(21);
      case "gopher":
        return t(70);
      case "http":
      case "ws":
        return t(80);
      case "https":
      case "wss":
        return t(443);
      default:
        return e2.scheme + "://";
    }
  } } });
  yr._inherit = function(e2) {
    Object.getOwnPropertyNames(yr.prototype).forEach(function(t) {
      if (!(t === "constructor" || t === "href")) {
        var r = Object.getOwnPropertyDescriptor(yr.prototype, t);
        Object.defineProperty(e2, t, r);
      }
    });
  };
});
var Ka = O((ed, ko) => {
  var To = pa(), s0 = Qr().isApiWritable;
  ko.exports = function(e2, t, r, n) {
    var l = e2.ctor;
    if (l) {
      var f2 = e2.props || {};
      if (e2.attributes)
        for (var _ in e2.attributes) {
          var y = e2.attributes[_];
          (typeof y != "object" || Array.isArray(y)) && (y = { type: y }), y.name || (y.name = _.toLowerCase()), f2[_] = To.property(y);
        }
      f2.constructor = { value: l, writable: s0 }, l.prototype = Object.create((e2.superclass || t).prototype, f2), e2.events && c0(l, e2.events), r[e2.name] = l;
    } else
      l = t;
    return (e2.tags || e2.tag && [e2.tag] || []).forEach(function(w) {
      n[w] = l;
    }), l;
  };
  function wo(e2, t, r, n) {
    this.body = e2, this.document = t, this.form = r, this.element = n;
  }
  wo.prototype.build = function() {
    return () => {
    };
  };
  function o0(e2, t, r, n) {
    var l = e2.ownerDocument || /* @__PURE__ */ Object.create(null), f2 = e2.form || /* @__PURE__ */ Object.create(null);
    e2[t] = new wo(n, l, f2, e2).build();
  }
  function c0(e2, t) {
    var r = e2.prototype;
    t.forEach(function(n) {
      Object.defineProperty(r, "on" + n, { get: function() {
        return this._getEventHandler(n);
      }, set: function(l) {
        this._setEventHandler(n, l);
      } }), To.registerChangeHandler(e2, "on" + n, o0);
    });
  }
});
var bn = O((gn) => {
  var Xa = Te(), So = Kt(), l0 = pn(), Oe = he(), No = $a(), u0 = Ka(), lt = gn.elements = {}, Tr = /* @__PURE__ */ Object.create(null);
  gn.createElement = function(e2, t, r) {
    var n = Tr[t] || d0;
    return new n(e2, t, r);
  };
  function C(e2) {
    return u0(e2, M, lt, Tr);
  }
  function ge(e2) {
    return { get: function() {
      var t = this._getattr(e2);
      if (t === null)
        return "";
      var r = this.doc._resolve(t);
      return r === null ? t : r;
    }, set: function(t) {
      this._setattr(e2, t);
    } };
  }
  function mn(e2) {
    return { get: function() {
      var t = this._getattr(e2);
      return t === null ? null : t.toLowerCase() === "use-credentials" ? "use-credentials" : "anonymous";
    }, set: function(t) {
      t == null ? this.removeAttribute(e2) : this._setattr(e2, t);
    } };
  }
  var wr = { type: ["", "no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url"], missing: "" }, f0 = { A: true, LINK: true, BUTTON: true, INPUT: true, SELECT: true, TEXTAREA: true, COMMAND: true }, $e = function(e2, t, r) {
    M.call(this, e2, t, r), this._form = null;
  }, M = gn.HTMLElement = C({ superclass: So, name: "HTMLElement", ctor: function(t, r, n) {
    So.call(this, t, r, Oe.NAMESPACE.HTML, n);
  }, props: { dangerouslySetInnerHTML: { set: function(e2) {
    this._innerHTML = e2;
  } }, innerHTML: { get: function() {
    return this.serialize();
  }, set: function(e2) {
    var t = this.ownerDocument.implementation.mozHTMLParser(this.ownerDocument._address, this);
    t.parse(e2 === null ? "" : String(e2), true);
    for (var r = this instanceof Tr.template ? this.content : this; r.hasChildNodes(); )
      r.removeChild(r.firstChild);
    r.appendChild(t._asDocumentFragment());
  } }, style: { get: function() {
    return this._style || (this._style = new l0(this)), this._style;
  }, set: function(e2) {
    e2 == null && (e2 = ""), this._setattr("style", String(e2));
  } }, blur: { value: function() {
  } }, focus: { value: function() {
  } }, forceSpellCheck: { value: function() {
  } }, click: { value: function() {
    if (!this._click_in_progress) {
      this._click_in_progress = true;
      try {
        this._pre_click_activation_steps && this._pre_click_activation_steps();
        var e2 = this.ownerDocument.createEvent("MouseEvent");
        e2.initMouseEvent("click", true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        var t = this.dispatchEvent(e2);
        t ? this._post_click_activation_steps && this._post_click_activation_steps(e2) : this._cancelled_activation_steps && this._cancelled_activation_steps();
      } finally {
        this._click_in_progress = false;
      }
    }
  } }, submit: { value: Oe.nyi } }, attributes: { title: String, lang: String, dir: { type: ["ltr", "rtl", "auto"], missing: "" }, accessKey: String, hidden: Boolean, tabIndex: { type: "long", default: function() {
    return this.tagName in f0 || this.contentEditable ? 0 : -1;
  } } }, events: ["abort", "canplay", "canplaythrough", "change", "click", "contextmenu", "cuechange", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "emptied", "ended", "input", "invalid", "keydown", "keypress", "keyup", "loadeddata", "loadedmetadata", "loadstart", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "mousewheel", "pause", "play", "playing", "progress", "ratechange", "readystatechange", "reset", "seeked", "seeking", "select", "show", "stalled", "submit", "suspend", "timeupdate", "volumechange", "waiting", "blur", "error", "focus", "load", "scroll"] }), d0 = C({ name: "HTMLUnknownElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  } }), Ke = { form: { get: function() {
    return this._form;
  } } };
  C({ tag: "a", name: "HTMLAnchorElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { _post_click_activation_steps: { value: function(e2) {
    this.href && (this.ownerDocument.defaultView.location = this.href);
  } } }, attributes: { href: ge, ping: String, download: String, target: String, rel: String, media: String, hreflang: String, type: String, referrerPolicy: wr, coords: String, charset: String, name: String, rev: String, shape: String } });
  No._inherit(Tr.a.prototype);
  C({ tag: "area", name: "HTMLAreaElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { alt: String, target: String, download: String, rel: String, media: String, href: ge, hreflang: String, type: String, shape: String, coords: String, ping: String, referrerPolicy: wr, noHref: Boolean } });
  No._inherit(Tr.area.prototype);
  C({ tag: "br", name: "HTMLBRElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { clear: String } });
  C({ tag: "base", name: "HTMLBaseElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { target: String } });
  C({ tag: "body", name: "HTMLBodyElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, events: ["afterprint", "beforeprint", "beforeunload", "blur", "error", "focus", "hashchange", "load", "message", "offline", "online", "pagehide", "pageshow", "popstate", "resize", "scroll", "storage", "unload"], attributes: { text: { type: String, treatNullAsEmptyString: true }, link: { type: String, treatNullAsEmptyString: true }, vLink: { type: String, treatNullAsEmptyString: true }, aLink: { type: String, treatNullAsEmptyString: true }, bgColor: { type: String, treatNullAsEmptyString: true }, background: String } });
  C({ tag: "button", name: "HTMLButtonElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: Ke, attributes: { name: String, value: String, disabled: Boolean, autofocus: Boolean, type: { type: ["submit", "reset", "button", "menu"], missing: "submit" }, formTarget: String, formNoValidate: Boolean, formMethod: { type: ["get", "post", "dialog"], invalid: "get", missing: "" }, formEnctype: { type: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], invalid: "application/x-www-form-urlencoded", missing: "" } } });
  C({ tag: "dl", name: "HTMLDListElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { compact: Boolean } });
  C({ tag: "data", name: "HTMLDataElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { value: String } });
  C({ tag: "datalist", name: "HTMLDataListElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  } });
  C({ tag: "details", name: "HTMLDetailsElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { open: Boolean } });
  C({ tag: "div", name: "HTMLDivElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { align: String } });
  C({ tag: "embed", name: "HTMLEmbedElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { src: ge, type: String, width: String, height: String, align: String, name: String } });
  C({ tag: "fieldset", name: "HTMLFieldSetElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: Ke, attributes: { disabled: Boolean, name: String } });
  C({ tag: "form", name: "HTMLFormElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { action: String, autocomplete: { type: ["on", "off"], missing: "on" }, name: String, acceptCharset: { name: "accept-charset" }, target: String, noValidate: Boolean, method: { type: ["get", "post", "dialog"], invalid: "get", missing: "get" }, enctype: { type: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], invalid: "application/x-www-form-urlencoded", missing: "application/x-www-form-urlencoded" }, encoding: { name: "enctype", type: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], invalid: "application/x-www-form-urlencoded", missing: "application/x-www-form-urlencoded" } } });
  C({ tag: "hr", name: "HTMLHRElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { align: String, color: String, noShade: Boolean, size: String, width: String } });
  C({ tag: "head", name: "HTMLHeadElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  } });
  C({ tags: ["h1", "h2", "h3", "h4", "h5", "h6"], name: "HTMLHeadingElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { align: String } });
  C({ tag: "html", name: "HTMLHtmlElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { version: String } });
  C({ tag: "iframe", name: "HTMLIFrameElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { src: ge, srcdoc: String, name: String, width: String, height: String, seamless: Boolean, allowFullscreen: Boolean, allowUserMedia: Boolean, allowPaymentRequest: Boolean, referrerPolicy: wr, align: String, scrolling: String, frameBorder: String, longDesc: ge, marginHeight: { type: String, treatNullAsEmptyString: true }, marginWidth: { type: String, treatNullAsEmptyString: true } } });
  C({ tag: "img", name: "HTMLImageElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { alt: String, src: ge, srcset: String, crossOrigin: mn, useMap: String, isMap: Boolean, height: { type: "unsigned long", default: 0 }, width: { type: "unsigned long", default: 0 }, referrerPolicy: wr, name: String, lowsrc: ge, align: String, hspace: { type: "unsigned long", default: 0 }, vspace: { type: "unsigned long", default: 0 }, longDesc: ge, border: { type: String, treatNullAsEmptyString: true } } });
  C({ tag: "input", name: "HTMLInputElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: { form: Ke.form, _post_click_activation_steps: { value: function(e2) {
    if (this.type === "checkbox")
      this.checked = !this.checked;
    else if (this.type === "radio")
      for (var t = this.form.getElementsByName(this.name), r = t.length - 1; r >= 0; r--) {
        var n = t[r];
        n.checked = n === this;
      }
  } } }, attributes: { name: String, disabled: Boolean, autofocus: Boolean, accept: String, alt: String, max: String, min: String, pattern: String, placeholder: String, step: String, dirName: String, defaultValue: { name: "value" }, multiple: Boolean, required: Boolean, readOnly: Boolean, checked: Boolean, value: String, src: ge, defaultChecked: { name: "checked", type: Boolean }, size: { type: "unsigned long", default: 20, min: 1, setmin: 1 }, width: { type: "unsigned long", min: 0, setmin: 0, default: 0 }, height: { type: "unsigned long", min: 0, setmin: 0, default: 0 }, minLength: { type: "unsigned long", min: 0, setmin: 0, default: -1 }, maxLength: { type: "unsigned long", min: 0, setmin: 0, default: -1 }, autocomplete: String, type: { type: ["text", "hidden", "search", "tel", "url", "email", "password", "datetime", "date", "month", "week", "time", "datetime-local", "number", "range", "color", "checkbox", "radio", "file", "submit", "image", "reset", "button"], missing: "text" }, formTarget: String, formNoValidate: Boolean, formMethod: { type: ["get", "post"], invalid: "get", missing: "" }, formEnctype: { type: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], invalid: "application/x-www-form-urlencoded", missing: "" }, inputMode: { type: ["verbatim", "latin", "latin-name", "latin-prose", "full-width-latin", "kana", "kana-name", "katakana", "numeric", "tel", "email", "url"], missing: "" }, align: String, useMap: String } });
  C({ tag: "keygen", name: "HTMLKeygenElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: Ke, attributes: { name: String, disabled: Boolean, autofocus: Boolean, challenge: String, keytype: { type: ["rsa"], missing: "" } } });
  C({ tag: "li", name: "HTMLLIElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { value: { type: "long", default: 0 }, type: String } });
  C({ tag: "label", name: "HTMLLabelElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: Ke, attributes: { htmlFor: { name: "for", type: String } } });
  C({ tag: "legend", name: "HTMLLegendElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { align: String } });
  C({ tag: "link", name: "HTMLLinkElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { href: ge, rel: String, media: String, hreflang: String, type: String, crossOrigin: mn, nonce: String, integrity: String, referrerPolicy: wr, charset: String, rev: String, target: String } });
  C({ tag: "map", name: "HTMLMapElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { name: String } });
  C({ tag: "menu", name: "HTMLMenuElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { type: { type: ["context", "popup", "toolbar"], missing: "toolbar" }, label: String, compact: Boolean } });
  C({ tag: "meta", name: "HTMLMetaElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { name: String, content: String, httpEquiv: { name: "http-equiv", type: String }, scheme: String } });
  C({ tag: "meter", name: "HTMLMeterElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: Ke });
  C({ tags: ["ins", "del"], name: "HTMLModElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { cite: ge, dateTime: String } });
  C({ tag: "ol", name: "HTMLOListElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { _numitems: { get: function() {
    var e2 = 0;
    return this.childNodes.forEach(function(t) {
      t.nodeType === Xa.ELEMENT_NODE && t.tagName === "LI" && e2++;
    }), e2;
  } } }, attributes: { type: String, reversed: Boolean, start: { type: "long", default: function() {
    return this.reversed ? this._numitems : 1;
  } }, compact: Boolean } });
  C({ tag: "object", name: "HTMLObjectElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: Ke, attributes: { data: ge, type: String, name: String, useMap: String, typeMustMatch: Boolean, width: String, height: String, align: String, archive: String, code: String, declare: Boolean, hspace: { type: "unsigned long", default: 0 }, standby: String, vspace: { type: "unsigned long", default: 0 }, codeBase: ge, codeType: String, border: { type: String, treatNullAsEmptyString: true } } });
  C({ tag: "optgroup", name: "HTMLOptGroupElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { disabled: Boolean, label: String } });
  C({ tag: "option", name: "HTMLOptionElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { form: { get: function() {
    for (var e2 = this.parentNode; e2 && e2.nodeType === Xa.ELEMENT_NODE; ) {
      if (e2.localName === "select")
        return e2.form;
      e2 = e2.parentNode;
    }
  } }, value: { get: function() {
    return this._getattr("value") || this.text;
  }, set: function(e2) {
    this._setattr("value", e2);
  } }, text: { get: function() {
    return this.textContent.replace(/[ \t\n\f\r]+/g, " ").trim();
  }, set: function(e2) {
    this.textContent = e2;
  } } }, attributes: { disabled: Boolean, defaultSelected: { name: "selected", type: Boolean }, label: String } });
  C({ tag: "output", name: "HTMLOutputElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: Ke, attributes: { name: String } });
  C({ tag: "p", name: "HTMLParagraphElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { align: String } });
  C({ tag: "param", name: "HTMLParamElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { name: String, value: String, type: String, valueType: String } });
  C({ tags: ["pre", "listing", "xmp"], name: "HTMLPreElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { width: { type: "long", default: 0 } } });
  C({ tag: "progress", name: "HTMLProgressElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: Ke, attributes: { max: { type: Number, float: true, default: 1, min: 0 } } });
  C({ tags: ["q", "blockquote"], name: "HTMLQuoteElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { cite: ge } });
  C({ tag: "script", name: "HTMLScriptElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { text: { get: function() {
    for (var e2 = "", t = 0, r = this.childNodes.length; t < r; t++) {
      var n = this.childNodes[t];
      n.nodeType === Xa.TEXT_NODE && (e2 += n._data);
    }
    return e2;
  }, set: function(e2) {
    this.removeChildren(), e2 !== null && e2 !== "" && this.appendChild(this.ownerDocument.createTextNode(e2));
  } } }, attributes: { src: ge, type: String, charset: String, defer: Boolean, async: Boolean, crossOrigin: mn, nonce: String, integrity: String } });
  C({ tag: "select", name: "HTMLSelectElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: { form: Ke.form, options: { get: function() {
    return this.getElementsByTagName("option");
  } } }, attributes: { autocomplete: String, name: String, disabled: Boolean, autofocus: Boolean, multiple: Boolean, required: Boolean, size: { type: "unsigned long", default: 0 } } });
  C({ tag: "source", name: "HTMLSourceElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { src: ge, type: String, media: String } });
  C({ tag: "span", name: "HTMLSpanElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  } });
  C({ tag: "style", name: "HTMLStyleElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { media: String, type: String, scoped: Boolean } });
  C({ tag: "caption", name: "HTMLTableCaptionElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { align: String } });
  C({ name: "HTMLTableCellElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { colSpan: { type: "unsigned long", default: 1 }, rowSpan: { type: "unsigned long", default: 1 }, scope: { type: ["row", "col", "rowgroup", "colgroup"], missing: "" }, abbr: String, align: String, axis: String, height: String, width: String, ch: { name: "char", type: String }, chOff: { name: "charoff", type: String }, noWrap: Boolean, vAlign: String, bgColor: { type: String, treatNullAsEmptyString: true } } });
  C({ tags: ["col", "colgroup"], name: "HTMLTableColElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { span: { type: "limited unsigned long with fallback", default: 1, min: 1 }, align: String, ch: { name: "char", type: String }, chOff: { name: "charoff", type: String }, vAlign: String, width: String } });
  C({ tag: "table", name: "HTMLTableElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { rows: { get: function() {
    return this.getElementsByTagName("tr");
  } } }, attributes: { align: String, border: String, frame: String, rules: String, summary: String, width: String, bgColor: { type: String, treatNullAsEmptyString: true }, cellPadding: { type: String, treatNullAsEmptyString: true }, cellSpacing: { type: String, treatNullAsEmptyString: true } } });
  C({ tag: "template", name: "HTMLTemplateElement", ctor: function(t, r, n) {
    M.call(this, t, r, n), this._contentFragment = t._templateDoc.createDocumentFragment();
  }, props: { content: { get: function() {
    return this._contentFragment;
  } }, serialize: { value: function() {
    return this.content.serialize();
  } } } });
  C({ tag: "tr", name: "HTMLTableRowElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { cells: { get: function() {
    return this.querySelectorAll("td,th");
  } } }, attributes: { align: String, ch: { name: "char", type: String }, chOff: { name: "charoff", type: String }, vAlign: String, bgColor: { type: String, treatNullAsEmptyString: true } } });
  C({ tags: ["thead", "tfoot", "tbody"], name: "HTMLTableSectionElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { rows: { get: function() {
    return this.getElementsByTagName("tr");
  } } }, attributes: { align: String, ch: { name: "char", type: String }, chOff: { name: "charoff", type: String }, vAlign: String } });
  C({ tag: "textarea", name: "HTMLTextAreaElement", ctor: function(t, r, n) {
    $e.call(this, t, r, n);
  }, props: { form: Ke.form, type: { get: function() {
    return "textarea";
  } }, defaultValue: { get: function() {
    return this.textContent;
  }, set: function(e2) {
    this.textContent = e2;
  } }, value: { get: function() {
    return this.defaultValue;
  }, set: function(e2) {
    this.defaultValue = e2;
  } }, textLength: { get: function() {
    return this.value.length;
  } } }, attributes: { autocomplete: String, name: String, disabled: Boolean, autofocus: Boolean, placeholder: String, wrap: String, dirName: String, required: Boolean, readOnly: Boolean, rows: { type: "limited unsigned long with fallback", default: 2 }, cols: { type: "limited unsigned long with fallback", default: 20 }, maxLength: { type: "unsigned long", min: 0, setmin: 0, default: -1 }, minLength: { type: "unsigned long", min: 0, setmin: 0, default: -1 }, inputMode: { type: ["verbatim", "latin", "latin-name", "latin-prose", "full-width-latin", "kana", "kana-name", "katakana", "numeric", "tel", "email", "url"], missing: "" } } });
  C({ tag: "time", name: "HTMLTimeElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { dateTime: String, pubDate: Boolean } });
  C({ tag: "title", name: "HTMLTitleElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { text: { get: function() {
    return this.textContent;
  } } } });
  C({ tag: "ul", name: "HTMLUListElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { type: String, compact: Boolean } });
  C({ name: "HTMLMediaElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { src: ge, crossOrigin: mn, preload: { type: ["metadata", "none", "auto", { value: "", alias: "auto" }], missing: "auto" }, loop: Boolean, autoplay: Boolean, mediaGroup: String, controls: Boolean, defaultMuted: { name: "muted", type: Boolean } } });
  C({ tag: "audio", superclass: lt.HTMLMediaElement, name: "HTMLAudioElement", ctor: function(t, r, n) {
    lt.HTMLMediaElement.call(this, t, r, n);
  } });
  C({ tag: "video", superclass: lt.HTMLMediaElement, name: "HTMLVideoElement", ctor: function(t, r, n) {
    lt.HTMLMediaElement.call(this, t, r, n);
  }, attributes: { poster: ge, width: { type: "unsigned long", min: 0, default: 0 }, height: { type: "unsigned long", min: 0, default: 0 } } });
  C({ tag: "td", superclass: lt.HTMLTableCellElement, name: "HTMLTableDataCellElement", ctor: function(t, r, n) {
    lt.HTMLTableCellElement.call(this, t, r, n);
  } });
  C({ tag: "th", superclass: lt.HTMLTableCellElement, name: "HTMLTableHeaderCellElement", ctor: function(t, r, n) {
    lt.HTMLTableCellElement.call(this, t, r, n);
  } });
  C({ tag: "frameset", name: "HTMLFrameSetElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  } });
  C({ tag: "frame", name: "HTMLFrameElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  } });
  C({ tag: "canvas", name: "HTMLCanvasElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { getContext: { value: Oe.nyi }, probablySupportsContext: { value: Oe.nyi }, setContext: { value: Oe.nyi }, transferControlToProxy: { value: Oe.nyi }, toDataURL: { value: Oe.nyi }, toBlob: { value: Oe.nyi } }, attributes: { width: { type: "unsigned long", default: 300 }, height: { type: "unsigned long", default: 150 } } });
  C({ tag: "dialog", name: "HTMLDialogElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { show: { value: Oe.nyi }, showModal: { value: Oe.nyi }, close: { value: Oe.nyi } }, attributes: { open: Boolean, returnValue: String } });
  C({ tag: "menuitem", name: "HTMLMenuItemElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, props: { _label: { get: function() {
    var e2 = this._getattr("label");
    return e2 !== null && e2 !== "" ? e2 : (e2 = this.textContent, e2.replace(/[ \t\n\f\r]+/g, " ").trim());
  } }, label: { get: function() {
    var e2 = this._getattr("label");
    return e2 !== null ? e2 : this._label;
  }, set: function(e2) {
    this._setattr("label", e2);
  } } }, attributes: { type: { type: ["command", "checkbox", "radio"], missing: "command" }, icon: ge, disabled: Boolean, checked: Boolean, radiogroup: String, default: Boolean } });
  C({ tag: "source", name: "HTMLSourceElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { srcset: String, sizes: String, media: String, src: ge, type: String } });
  C({ tag: "track", name: "HTMLTrackElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { src: ge, srclang: String, label: String, default: Boolean, kind: { type: ["subtitles", "captions", "descriptions", "chapters", "metadata"], missing: "subtitles", invalid: "metadata" } }, props: { NONE: { get: function() {
    return 0;
  } }, LOADING: { get: function() {
    return 1;
  } }, LOADED: { get: function() {
    return 2;
  } }, ERROR: { get: function() {
    return 3;
  } }, readyState: { get: Oe.nyi }, track: { get: Oe.nyi } } });
  C({ tag: "font", name: "HTMLFontElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { color: { type: String, treatNullAsEmptyString: true }, face: { type: String }, size: { type: String } } });
  C({ tag: "dir", name: "HTMLDirectoryElement", ctor: function(t, r, n) {
    M.call(this, t, r, n);
  }, attributes: { compact: Boolean } });
  C({ tags: ["abbr", "address", "article", "aside", "b", "bdi", "bdo", "cite", "code", "dd", "dfn", "dt", "em", "figcaption", "figure", "footer", "header", "hgroup", "i", "kbd", "main", "mark", "nav", "noscript", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "section", "small", "strong", "sub", "summary", "sup", "u", "var", "wbr", "acronym", "basefont", "big", "center", "nobr", "noembed", "noframes", "plaintext", "strike", "tt"] });
});
var Ja = O((_n) => {
  var Co = Kt(), h0 = Ka(), x0 = he(), p0 = pn(), m0 = _n.elements = {}, Ao = /* @__PURE__ */ Object.create(null);
  _n.createElement = function(e2, t, r) {
    var n = Ao[t] || Za;
    return new n(e2, t, r);
  };
  function Qa(e2) {
    return h0(e2, Za, m0, Ao);
  }
  var Za = Qa({ superclass: Co, name: "SVGElement", ctor: function(t, r, n) {
    Co.call(this, t, r, x0.NAMESPACE.SVG, n);
  }, props: { style: { get: function() {
    return this._style || (this._style = new p0(this)), this._style;
  } } } });
  Qa({ name: "SVGSVGElement", ctor: function(t, r, n) {
    Za.call(this, t, r, n);
  }, tag: "svg", props: { createSVGRect: { value: function() {
    return _n.createElement(this.ownerDocument, "rect", null);
  } } } });
  Qa({ tags: ["a", "altGlyph", "altGlyphDef", "altGlyphItem", "animate", "animateColor", "animateMotion", "animateTransform", "circle", "clipPath", "color-profile", "cursor", "defs", "desc", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "font", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignObject", "g", "glyph", "glyphRef", "hkern", "image", "line", "linearGradient", "marker", "mask", "metadata", "missing-glyph", "mpath", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "script", "set", "stop", "style", "switch", "symbol", "text", "textPath", "title", "tref", "tspan", "use", "view", "vkern"] });
});
var Do = O((nd, Lo) => {
  Lo.exports = { VALUE: 1, ATTR: 2, REMOVE_ATTR: 3, REMOVE: 4, MOVE: 5, INSERT: 6 };
});
var vn = O((ad, Uo) => {
  Uo.exports = Sr;
  var Se = Te(), g0 = It(), Ho = en(), wt = Kt(), b0 = Da(), _0 = Ra(), kr = Vt(), E0 = qa(), v0 = Fa(), y0 = Nr(), T0 = no(), w0 = lo(), Mo = Er(), Ro = xn(), Io = sn(), k0 = Ya(), En = tn(), ei = bn(), S0 = Ja(), K = he(), Qt = Do(), Jt = K.NAMESPACE, ti = Qr().isApiWritable;
  function Sr(e2, t) {
    Ho.call(this), this.nodeType = Se.DOCUMENT_NODE, this.isHTML = e2, this._address = t || "about:blank", this.readyState = "loading", this.implementation = new y0(this), this.ownerDocument = null, this._contentType = e2 ? "text/html" : "application/xml", this.doctype = null, this.documentElement = null, this._templateDocCache = null, this._nodeIterators = null, this._nid = 1, this._nextnid = 2, this._nodes = [null, this], this.byId = /* @__PURE__ */ Object.create(null), this.modclock = 0;
  }
  var N0 = { event: "Event", customevent: "CustomEvent", uievent: "UIEvent", mouseevent: "MouseEvent" }, C0 = { events: "event", htmlevents: "event", mouseevents: "mouseevent", mutationevents: "mutationevent", uievents: "uievent" }, Zt = function(e2, t, r) {
    return { get: function() {
      var n = e2.call(this);
      return n ? n[t] : r;
    }, set: function(n) {
      var l = e2.call(this);
      l && (l[t] = n);
    } };
  };
  function Oo(e2, t) {
    var r, n, l;
    return e2 === "" && (e2 = null), En.isValidQName(t) || K.InvalidCharacterError(), r = null, n = t, l = t.indexOf(":"), l >= 0 && (r = t.substring(0, l), n = t.substring(l + 1)), r !== null && e2 === null && K.NamespaceError(), r === "xml" && e2 !== Jt.XML && K.NamespaceError(), (r === "xmlns" || t === "xmlns") && e2 !== Jt.XMLNS && K.NamespaceError(), e2 === Jt.XMLNS && !(r === "xmlns" || t === "xmlns") && K.NamespaceError(), { namespace: e2, prefix: r, localName: n };
  }
  Sr.prototype = Object.create(Ho.prototype, { _setMutationHandler: { value: function(e2) {
    this.mutationHandler = e2;
  } }, _dispatchRendererEvent: { value: function(e2, t, r) {
    var n = this._nodes[e2];
    !n || n._dispatchEvent(new kr(t, r), true);
  } }, nodeName: { value: "#document" }, nodeValue: { get: function() {
    return null;
  }, set: function() {
  } }, documentURI: { get: function() {
    return this._address;
  }, set: K.nyi }, compatMode: { get: function() {
    return this._quirks ? "BackCompat" : "CSS1Compat";
  } }, createTextNode: { value: function(e2) {
    return new b0(this, String(e2));
  } }, createComment: { value: function(e2) {
    return new _0(this, e2);
  } }, createDocumentFragment: { value: function() {
    return new E0(this);
  } }, createProcessingInstruction: { value: function(e2, t) {
    return (!En.isValidName(e2) || t.indexOf("?>") !== -1) && K.InvalidCharacterError(), new v0(this, e2, t);
  } }, createAttribute: { value: function(e2) {
    return e2 = String(e2), En.isValidName(e2) || K.InvalidCharacterError(), this.isHTML && (e2 = K.toASCIILowerCase(e2)), new wt._Attr(null, e2, null, null, "");
  } }, createAttributeNS: { value: function(e2, t) {
    e2 = e2 == null || e2 === "" ? null : String(e2), t = String(t);
    var r = Oo(e2, t);
    return new wt._Attr(null, r.localName, r.prefix, r.namespace, "");
  } }, createElement: { value: function(e2) {
    return e2 = String(e2), En.isValidName(e2) || K.InvalidCharacterError(), this.isHTML ? (/[A-Z]/.test(e2) && (e2 = K.toASCIILowerCase(e2)), ei.createElement(this, e2, null)) : this.contentType === "application/xhtml+xml" ? ei.createElement(this, e2, null) : new wt(this, e2, null, null);
  }, writable: ti }, createElementNS: { value: function(e2, t) {
    e2 = e2 == null || e2 === "" ? null : String(e2), t = String(t);
    var r = Oo(e2, t);
    return this._createElementNS(r.localName, r.namespace, r.prefix);
  }, writable: ti }, _createElementNS: { value: function(e2, t, r) {
    return t === Jt.HTML ? ei.createElement(this, e2, r) : t === Jt.SVG ? S0.createElement(this, e2, r) : new wt(this, e2, t, r);
  } }, createEvent: { value: function(t) {
    t = t.toLowerCase();
    var r = C0[t] || t, n = k0[N0[r]];
    if (n) {
      var l = new n();
      return l._initialized = false, l;
    } else
      K.NotSupportedError();
  } }, createTreeWalker: { value: function(e2, t, r) {
    if (!e2)
      throw new TypeError("root argument is required");
    if (!(e2 instanceof Se))
      throw new TypeError("root not a node");
    return t = t === void 0 ? Mo.SHOW_ALL : +t, r = r === void 0 ? null : r, new T0(e2, t, r);
  } }, createNodeIterator: { value: function(e2, t, r) {
    if (!e2)
      throw new TypeError("root argument is required");
    if (!(e2 instanceof Se))
      throw new TypeError("root not a node");
    return t = t === void 0 ? Mo.SHOW_ALL : +t, r = r === void 0 ? null : r, new w0(e2, t, r);
  } }, _attachNodeIterator: { value: function(e2) {
    this._nodeIterators || (this._nodeIterators = []), this._nodeIterators.push(e2);
  } }, _detachNodeIterator: { value: function(e2) {
    var t = this._nodeIterators.indexOf(e2);
    this._nodeIterators.splice(t, 1);
  } }, _preremoveNodeIterators: { value: function(e2) {
    this._nodeIterators && this._nodeIterators.forEach(function(t) {
      t._preremove(e2);
    });
  } }, _updateDocTypeElement: { value: function() {
    this.doctype = this.documentElement = null;
    for (var t = this.firstChild; t !== null; t = t.nextSibling)
      t.nodeType === Se.DOCUMENT_TYPE_NODE ? this.doctype = t : t.nodeType === Se.ELEMENT_NODE && (this.documentElement = t);
  } }, insertBefore: { value: function(t, r) {
    return Se.prototype.insertBefore.call(this, t, r), this._updateDocTypeElement(), t;
  } }, replaceChild: { value: function(t, r) {
    return Se.prototype.replaceChild.call(this, t, r), this._updateDocTypeElement(), r;
  } }, removeChild: { value: function(t) {
    return Se.prototype.removeChild.call(this, t), this._updateDocTypeElement(), t;
  } }, getElementById: { value: function(e2) {
    var t = this.byId[e2];
    return t ? t instanceof ut ? t.getFirst() : t : null;
  } }, _hasMultipleElementsWithId: { value: function(e2) {
    return this.byId[e2] instanceof ut;
  } }, getElementsByName: { value: wt.prototype.getElementsByName }, getElementsByTagName: { value: wt.prototype.getElementsByTagName }, getElementsByTagNameNS: { value: wt.prototype.getElementsByTagNameNS }, getElementsByClassName: { value: wt.prototype.getElementsByClassName }, adoptNode: { value: function(t) {
    return t.nodeType === Se.DOCUMENT_NODE && K.NotSupportedError(), t.nodeType === Se.ATTRIBUTE_NODE || (t.parentNode && t.parentNode.removeChild(t), t.ownerDocument !== this && Bo(t, this)), t;
  } }, importNode: { value: function(t, r) {
    return this.adoptNode(t.cloneNode(r));
  }, writable: ti }, origin: { get: function() {
    return null;
  } }, characterSet: { get: function() {
    return "UTF-8";
  } }, contentType: { get: function() {
    return this._contentType;
  } }, URL: { get: function() {
    return this._address;
  } }, domain: { get: K.nyi, set: K.nyi }, referrer: { get: K.nyi }, cookie: { get: K.nyi, set: K.nyi }, lastModified: { get: K.nyi }, location: { get: function() {
    return this.defaultView ? this.defaultView.location : null;
  }, set: K.nyi }, _titleElement: { get: function() {
    return this.getElementsByTagName("title").item(0) || null;
  } }, title: { get: function() {
    var e2 = this._titleElement, t = e2 ? e2.textContent : "";
    return t.replace(/[ \t\n\r\f]+/g, " ").replace(/(^ )|( $)/g, "");
  }, set: function(e2) {
    var t = this._titleElement, r = this.head;
    !t && !r || (t || (t = this.createElement("title"), r.appendChild(t)), t.textContent = e2);
  } }, dir: Zt(function() {
    var e2 = this.documentElement;
    if (e2 && e2.tagName === "HTML")
      return e2;
  }, "dir", ""), fgColor: Zt(function() {
    return this.body;
  }, "text", ""), linkColor: Zt(function() {
    return this.body;
  }, "link", ""), vlinkColor: Zt(function() {
    return this.body;
  }, "vLink", ""), alinkColor: Zt(function() {
    return this.body;
  }, "aLink", ""), bgColor: Zt(function() {
    return this.body;
  }, "bgColor", ""), charset: { get: function() {
    return this.characterSet;
  } }, inputEncoding: { get: function() {
    return this.characterSet;
  } }, scrollingElement: { get: function() {
    return this._quirks ? this.body : this.documentElement;
  } }, body: { get: function() {
    return qo(this.documentElement, "body");
  }, set: K.nyi }, head: { get: function() {
    return qo(this.documentElement, "head");
  } }, images: { get: K.nyi }, embeds: { get: K.nyi }, plugins: { get: K.nyi }, links: { get: K.nyi }, forms: { get: K.nyi }, scripts: { get: K.nyi }, applets: { get: function() {
    return [];
  } }, activeElement: { get: function() {
    return null;
  } }, innerHTML: { get: function() {
    return this.serialize();
  }, set: K.nyi }, outerHTML: { get: function() {
    return this.serialize();
  }, set: K.nyi }, write: { value: function(e2) {
    if (this.isHTML || K.InvalidStateError(), !!this._parser) {
      this._parser;
      var t = arguments.join("");
      this._parser.parse(t);
    }
  } }, writeln: { value: function(t) {
    this.write(Array.prototype.join.call(arguments, "") + `
`);
  } }, open: { value: function() {
    this.documentElement = null;
  } }, close: { value: function() {
    this.readyState = "interactive", this._dispatchEvent(new kr("readystatechange"), true), this._dispatchEvent(new kr("DOMContentLoaded"), true), this.readyState = "complete", this._dispatchEvent(new kr("readystatechange"), true), this.defaultView && this.defaultView._dispatchEvent(new kr("load"), true);
  } }, clone: { value: function() {
    var t = new Sr(this.isHTML, this._address);
    return t._quirks = this._quirks, t._contentType = this._contentType, t;
  } }, cloneNode: { value: function(t) {
    var r = Se.prototype.cloneNode.call(this, false);
    if (t)
      for (var n = this.firstChild; n !== null; n = n.nextSibling)
        r._appendChild(r.importNode(n, true));
    return r._updateDocTypeElement(), r;
  } }, isEqual: { value: function(t) {
    return true;
  } }, mutateValue: { value: function(e2) {
    this.mutationHandler && this.mutationHandler({ type: Qt.VALUE, target: e2, data: e2.data });
  } }, mutateAttr: { value: function(e2, t) {
    this.mutationHandler && this.mutationHandler({ type: Qt.ATTR, target: e2.ownerElement, attr: e2 });
  } }, mutateRemoveAttr: { value: function(e2) {
    this.mutationHandler && this.mutationHandler({ type: Qt.REMOVE_ATTR, target: e2.ownerElement, attr: e2 });
  } }, mutateRemove: { value: function(e2) {
    this.mutationHandler && this.mutationHandler({ type: Qt.REMOVE, target: e2.parentNode, node: e2 }), Po(e2);
  } }, mutateInsert: { value: function(e2) {
    Fo(e2), this.mutationHandler && this.mutationHandler({ type: Qt.INSERT, target: e2.parentNode, node: e2 });
  } }, mutateMove: { value: function(e2) {
    this.mutationHandler && this.mutationHandler({ type: Qt.MOVE, target: e2 });
  } }, addId: { value: function(t, r) {
    var n = this.byId[t];
    n ? (n instanceof ut || (n = new ut(n), this.byId[t] = n), n.add(r)) : this.byId[t] = r;
  } }, delId: { value: function(t, r) {
    var n = this.byId[t];
    K.assert(n), n instanceof ut ? (n.del(r), n.length === 1 && (this.byId[t] = n.downgrade())) : this.byId[t] = void 0;
  } }, _resolve: { value: function(e2) {
    return new Ro(this._documentBaseURL).resolve(e2);
  } }, _documentBaseURL: { get: function() {
    var e2 = this._address;
    e2 === "about:blank" && (e2 = "/");
    var t = this.querySelector("base[href]");
    return t ? new Ro(e2).resolve(t.getAttribute("href")) : e2;
  } }, _templateDoc: { get: function() {
    if (!this._templateDocCache) {
      var e2 = new Sr(this.isHTML, this._address);
      this._templateDocCache = e2._templateDocCache = e2;
    }
    return this._templateDocCache;
  } }, querySelector: { value: function(e2) {
    return Io(e2, this)[0];
  } }, querySelectorAll: { value: function(e2) {
    var t = Io(e2, this);
    return t.item ? t : new g0(t);
  } } });
  var A0 = ["abort", "canplay", "canplaythrough", "change", "click", "contextmenu", "cuechange", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "emptied", "ended", "input", "invalid", "keydown", "keypress", "keyup", "loadeddata", "loadedmetadata", "loadstart", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "mousewheel", "pause", "play", "playing", "progress", "ratechange", "readystatechange", "reset", "seeked", "seeking", "select", "show", "stalled", "submit", "suspend", "timeupdate", "volumechange", "waiting", "blur", "error", "focus", "load", "scroll"];
  A0.forEach(function(e2) {
    Object.defineProperty(Sr.prototype, "on" + e2, { get: function() {
      return this._getEventHandler(e2);
    }, set: function(t) {
      this._setEventHandler(e2, t);
    } });
  });
  function qo(e2, t) {
    if (e2 && e2.isHTML) {
      for (var r = e2.firstChild; r !== null; r = r.nextSibling)
        if (r.nodeType === Se.ELEMENT_NODE && r.localName === t && r.namespaceURI === Jt.HTML)
          return r;
    }
    return null;
  }
  function L0(e2) {
    if (e2._nid = e2.ownerDocument._nextnid++, e2.ownerDocument._nodes[e2._nid] = e2, e2.nodeType === Se.ELEMENT_NODE) {
      var t = e2.getAttribute("id");
      t && e2.ownerDocument.addId(t, e2), e2._roothook && e2._roothook();
    }
  }
  function D0(e2) {
    if (e2.nodeType === Se.ELEMENT_NODE) {
      var t = e2.getAttribute("id");
      t && e2.ownerDocument.delId(t, e2);
    }
    e2.ownerDocument._nodes[e2._nid] = void 0, e2._nid = void 0;
  }
  function Fo(e2) {
    if (L0(e2), e2.nodeType === Se.ELEMENT_NODE)
      for (var t = e2.firstChild; t !== null; t = t.nextSibling)
        Fo(t);
  }
  function Po(e2) {
    D0(e2);
    for (var t = e2.firstChild; t !== null; t = t.nextSibling)
      Po(t);
  }
  function Bo(e2, t) {
    e2.ownerDocument = t, e2._lastModTime = void 0, Object.prototype.hasOwnProperty.call(e2, "_tagName") && (e2._tagName = void 0);
    for (var r = e2.firstChild; r !== null; r = r.nextSibling)
      Bo(r, t);
  }
  function ut(e2) {
    this.nodes = /* @__PURE__ */ Object.create(null), this.nodes[e2._nid] = e2, this.length = 1, this.firstNode = void 0;
  }
  ut.prototype.add = function(e2) {
    this.nodes[e2._nid] || (this.nodes[e2._nid] = e2, this.length++, this.firstNode = void 0);
  };
  ut.prototype.del = function(e2) {
    this.nodes[e2._nid] && (delete this.nodes[e2._nid], this.length--, this.firstNode = void 0);
  };
  ut.prototype.getFirst = function() {
    if (!this.firstNode) {
      var e2;
      for (e2 in this.nodes)
        (this.firstNode === void 0 || this.firstNode.compareDocumentPosition(this.nodes[e2]) & Se.DOCUMENT_POSITION_PRECEDING) && (this.firstNode = this.nodes[e2]);
    }
    return this.firstNode;
  };
  ut.prototype.downgrade = function() {
    if (this.length === 1) {
      var e2;
      for (e2 in this.nodes)
        return this.nodes[e2];
    }
    return this;
  };
});
var Tn = O((id, zo) => {
  zo.exports = yn;
  var M0 = Te(), Vo = Aa(), R0 = on();
  function yn(e2, t, r, n) {
    Vo.call(this), this.nodeType = M0.DOCUMENT_TYPE_NODE, this.ownerDocument = e2 || null, this.name = t, this.publicId = r || "", this.systemId = n || "";
  }
  yn.prototype = Object.create(Vo.prototype, { nodeName: { get: function() {
    return this.name;
  } }, nodeValue: { get: function() {
    return null;
  }, set: function() {
  } }, clone: { value: function() {
    return new yn(this.ownerDocument, this.name, this.publicId, this.systemId);
  } }, isEqual: { value: function(t) {
    return this.name === t.name && this.publicId === t.publicId && this.systemId === t.systemId;
  } } });
  Object.defineProperties(yn.prototype, R0);
});
var Ln = O((sd, dc) => {
  dc.exports = Y;
  var I0 = vn(), O0 = Tn(), ri = Te(), q = he().NAMESPACE, ac = bn(), ee = ac.elements, qt = Function.prototype.apply.bind(Array.prototype.push), wn = -1, er = 1, Ne = 2, W = 3, rt = 4, q0 = 5, H0 = [], F0 = /^HTML$|^-\/\/W3O\/\/DTD W3 HTML Strict 3\.0\/\/EN\/\/$|^-\/W3C\/DTD HTML 4\.0 Transitional\/EN$|^\+\/\/Silmaril\/\/dtd html Pro v0r11 19970101\/\/|^-\/\/AdvaSoft Ltd\/\/DTD HTML 3\.0 asWedit \+ extensions\/\/|^-\/\/AS\/\/DTD HTML 3\.0 asWedit \+ extensions\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Level 1\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Level 2\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Strict Level 1\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Strict Level 2\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Strict\/\/|^-\/\/IETF\/\/DTD HTML 2\.0\/\/|^-\/\/IETF\/\/DTD HTML 2\.1E\/\/|^-\/\/IETF\/\/DTD HTML 3\.0\/\/|^-\/\/IETF\/\/DTD HTML 3\.2 Final\/\/|^-\/\/IETF\/\/DTD HTML 3\.2\/\/|^-\/\/IETF\/\/DTD HTML 3\/\/|^-\/\/IETF\/\/DTD HTML Level 0\/\/|^-\/\/IETF\/\/DTD HTML Level 1\/\/|^-\/\/IETF\/\/DTD HTML Level 2\/\/|^-\/\/IETF\/\/DTD HTML Level 3\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 0\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 1\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 2\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 3\/\/|^-\/\/IETF\/\/DTD HTML Strict\/\/|^-\/\/IETF\/\/DTD HTML\/\/|^-\/\/Metrius\/\/DTD Metrius Presentational\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 2\.0 HTML Strict\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 2\.0 HTML\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 2\.0 Tables\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 3\.0 HTML Strict\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 3\.0 HTML\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 3\.0 Tables\/\/|^-\/\/Netscape Comm\. Corp\.\/\/DTD HTML\/\/|^-\/\/Netscape Comm\. Corp\.\/\/DTD Strict HTML\/\/|^-\/\/O'Reilly and Associates\/\/DTD HTML 2\.0\/\/|^-\/\/O'Reilly and Associates\/\/DTD HTML Extended 1\.0\/\/|^-\/\/O'Reilly and Associates\/\/DTD HTML Extended Relaxed 1\.0\/\/|^-\/\/SoftQuad Software\/\/DTD HoTMetaL PRO 6\.0::19990601::extensions to HTML 4\.0\/\/|^-\/\/SoftQuad\/\/DTD HoTMetaL PRO 4\.0::19971010::extensions to HTML 4\.0\/\/|^-\/\/Spyglass\/\/DTD HTML 2\.0 Extended\/\/|^-\/\/SQ\/\/DTD HTML 2\.0 HoTMetaL \+ extensions\/\/|^-\/\/Sun Microsystems Corp\.\/\/DTD HotJava HTML\/\/|^-\/\/Sun Microsystems Corp\.\/\/DTD HotJava Strict HTML\/\/|^-\/\/W3C\/\/DTD HTML 3 1995-03-24\/\/|^-\/\/W3C\/\/DTD HTML 3\.2 Draft\/\/|^-\/\/W3C\/\/DTD HTML 3\.2 Final\/\/|^-\/\/W3C\/\/DTD HTML 3\.2\/\/|^-\/\/W3C\/\/DTD HTML 3\.2S Draft\/\/|^-\/\/W3C\/\/DTD HTML 4\.0 Frameset\/\/|^-\/\/W3C\/\/DTD HTML 4\.0 Transitional\/\/|^-\/\/W3C\/\/DTD HTML Experimental 19960712\/\/|^-\/\/W3C\/\/DTD HTML Experimental 970421\/\/|^-\/\/W3C\/\/DTD W3 HTML\/\/|^-\/\/W3O\/\/DTD W3 HTML 3\.0\/\/|^-\/\/WebTechs\/\/DTD Mozilla HTML 2\.0\/\/|^-\/\/WebTechs\/\/DTD Mozilla HTML\/\//i, P0 = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd", jo = /^-\/\/W3C\/\/DTD HTML 4\.01 Frameset\/\/|^-\/\/W3C\/\/DTD HTML 4\.01 Transitional\/\//i, B0 = /^-\/\/W3C\/\/DTD XHTML 1\.0 Frameset\/\/|^-\/\/W3C\/\/DTD XHTML 1\.0 Transitional\/\//i, Ft = /* @__PURE__ */ Object.create(null);
  Ft[q.HTML] = { __proto__: null, address: true, applet: true, area: true, article: true, aside: true, base: true, basefont: true, bgsound: true, blockquote: true, body: true, br: true, button: true, caption: true, center: true, col: true, colgroup: true, dd: true, details: true, dir: true, div: true, dl: true, dt: true, embed: true, fieldset: true, figcaption: true, figure: true, footer: true, form: true, frame: true, frameset: true, h1: true, h2: true, h3: true, h4: true, h5: true, h6: true, head: true, header: true, hgroup: true, hr: true, html: true, iframe: true, img: true, input: true, li: true, link: true, listing: true, main: true, marquee: true, menu: true, meta: true, nav: true, noembed: true, noframes: true, noscript: true, object: true, ol: true, p: true, param: true, plaintext: true, pre: true, script: true, section: true, select: true, source: true, style: true, summary: true, table: true, tbody: true, td: true, template: true, textarea: true, tfoot: true, th: true, thead: true, title: true, tr: true, track: true, ul: true, wbr: true, xmp: true };
  Ft[q.SVG] = { __proto__: null, foreignObject: true, desc: true, title: true };
  Ft[q.MATHML] = { __proto__: null, mi: true, mo: true, mn: true, ms: true, mtext: true, "annotation-xml": true };
  var ii = /* @__PURE__ */ Object.create(null);
  ii[q.HTML] = { __proto__: null, address: true, div: true, p: true };
  var ic = /* @__PURE__ */ Object.create(null);
  ic[q.HTML] = { __proto__: null, dd: true, dt: true };
  var tr = /* @__PURE__ */ Object.create(null);
  tr[q.HTML] = { __proto__: null, table: true, thead: true, tbody: true, tfoot: true, tr: true };
  var sc = /* @__PURE__ */ Object.create(null);
  sc[q.HTML] = { __proto__: null, dd: true, dt: true, li: true, menuitem: true, optgroup: true, option: true, p: true, rb: true, rp: true, rt: true, rtc: true };
  var oc = /* @__PURE__ */ Object.create(null);
  oc[q.HTML] = { __proto__: null, caption: true, colgroup: true, dd: true, dt: true, li: true, optgroup: true, option: true, p: true, rb: true, rp: true, rt: true, rtc: true, tbody: true, td: true, tfoot: true, th: true, thead: true, tr: true };
  var Nn = /* @__PURE__ */ Object.create(null);
  Nn[q.HTML] = { __proto__: null, table: true, template: true, html: true };
  var Cn = /* @__PURE__ */ Object.create(null);
  Cn[q.HTML] = { __proto__: null, tbody: true, tfoot: true, thead: true, template: true, html: true };
  var si = /* @__PURE__ */ Object.create(null);
  si[q.HTML] = { __proto__: null, tr: true, template: true, html: true };
  var cc = /* @__PURE__ */ Object.create(null);
  cc[q.HTML] = { __proto__: null, button: true, fieldset: true, input: true, keygen: true, object: true, output: true, select: true, textarea: true, img: true };
  var nt = /* @__PURE__ */ Object.create(null);
  nt[q.HTML] = { __proto__: null, applet: true, caption: true, html: true, table: true, td: true, th: true, marquee: true, object: true, template: true };
  nt[q.MATHML] = { __proto__: null, mi: true, mo: true, mn: true, ms: true, mtext: true, "annotation-xml": true };
  nt[q.SVG] = { __proto__: null, foreignObject: true, desc: true, title: true };
  var An = Object.create(nt);
  An[q.HTML] = Object.create(nt[q.HTML]);
  An[q.HTML].ol = true;
  An[q.HTML].ul = true;
  var oi = Object.create(nt);
  oi[q.HTML] = Object.create(nt[q.HTML]);
  oi[q.HTML].button = true;
  var lc = /* @__PURE__ */ Object.create(null);
  lc[q.HTML] = { __proto__: null, html: true, table: true, template: true };
  var U0 = /* @__PURE__ */ Object.create(null);
  U0[q.HTML] = { __proto__: null, optgroup: true, option: true };
  var uc = /* @__PURE__ */ Object.create(null);
  uc[q.MATHML] = { __proto__: null, mi: true, mo: true, mn: true, ms: true, mtext: true };
  var fc = /* @__PURE__ */ Object.create(null);
  fc[q.SVG] = { __proto__: null, foreignObject: true, desc: true, title: true };
  var Go = { __proto__: null, "xlink:actuate": q.XLINK, "xlink:arcrole": q.XLINK, "xlink:href": q.XLINK, "xlink:role": q.XLINK, "xlink:show": q.XLINK, "xlink:title": q.XLINK, "xlink:type": q.XLINK, "xml:base": q.XML, "xml:lang": q.XML, "xml:space": q.XML, xmlns: q.XMLNS, "xmlns:xlink": q.XMLNS }, Wo = { __proto__: null, attributename: "attributeName", attributetype: "attributeType", basefrequency: "baseFrequency", baseprofile: "baseProfile", calcmode: "calcMode", clippathunits: "clipPathUnits", diffuseconstant: "diffuseConstant", edgemode: "edgeMode", filterunits: "filterUnits", glyphref: "glyphRef", gradienttransform: "gradientTransform", gradientunits: "gradientUnits", kernelmatrix: "kernelMatrix", kernelunitlength: "kernelUnitLength", keypoints: "keyPoints", keysplines: "keySplines", keytimes: "keyTimes", lengthadjust: "lengthAdjust", limitingconeangle: "limitingConeAngle", markerheight: "markerHeight", markerunits: "markerUnits", markerwidth: "markerWidth", maskcontentunits: "maskContentUnits", maskunits: "maskUnits", numoctaves: "numOctaves", pathlength: "pathLength", patterncontentunits: "patternContentUnits", patterntransform: "patternTransform", patternunits: "patternUnits", pointsatx: "pointsAtX", pointsaty: "pointsAtY", pointsatz: "pointsAtZ", preservealpha: "preserveAlpha", preserveaspectratio: "preserveAspectRatio", primitiveunits: "primitiveUnits", refx: "refX", refy: "refY", repeatcount: "repeatCount", repeatdur: "repeatDur", requiredextensions: "requiredExtensions", requiredfeatures: "requiredFeatures", specularconstant: "specularConstant", specularexponent: "specularExponent", spreadmethod: "spreadMethod", startoffset: "startOffset", stddeviation: "stdDeviation", stitchtiles: "stitchTiles", surfacescale: "surfaceScale", systemlanguage: "systemLanguage", tablevalues: "tableValues", targetx: "targetX", targety: "targetY", textlength: "textLength", viewbox: "viewBox", viewtarget: "viewTarget", xchannelselector: "xChannelSelector", ychannelselector: "yChannelSelector", zoomandpan: "zoomAndPan" }, Yo = { __proto__: null, altglyph: "altGlyph", altglyphdef: "altGlyphDef", altglyphitem: "altGlyphItem", animatecolor: "animateColor", animatemotion: "animateMotion", animatetransform: "animateTransform", clippath: "clipPath", feblend: "feBlend", fecolormatrix: "feColorMatrix", fecomponenttransfer: "feComponentTransfer", fecomposite: "feComposite", feconvolvematrix: "feConvolveMatrix", fediffuselighting: "feDiffuseLighting", fedisplacementmap: "feDisplacementMap", fedistantlight: "feDistantLight", feflood: "feFlood", fefunca: "feFuncA", fefuncb: "feFuncB", fefuncg: "feFuncG", fefuncr: "feFuncR", fegaussianblur: "feGaussianBlur", feimage: "feImage", femerge: "feMerge", femergenode: "feMergeNode", femorphology: "feMorphology", feoffset: "feOffset", fepointlight: "fePointLight", fespecularlighting: "feSpecularLighting", fespotlight: "feSpotLight", fetile: "feTile", feturbulence: "feTurbulence", foreignobject: "foreignObject", glyphref: "glyphRef", lineargradient: "linearGradient", radialgradient: "radialGradient", textpath: "textPath" }, $o = { __proto__: null, 0: 65533, 128: 8364, 130: 8218, 131: 402, 132: 8222, 133: 8230, 134: 8224, 135: 8225, 136: 710, 137: 8240, 138: 352, 139: 8249, 140: 338, 142: 381, 145: 8216, 146: 8217, 147: 8220, 148: 8221, 149: 8226, 150: 8211, 151: 8212, 152: 732, 153: 8482, 154: 353, 155: 8250, 156: 339, 158: 382, 159: 376 }, V0 = { __proto__: null, AElig: 198, "AElig;": 198, AMP: 38, "AMP;": 38, Aacute: 193, "Aacute;": 193, "Abreve;": 258, Acirc: 194, "Acirc;": 194, "Acy;": 1040, "Afr;": [55349, 56580], Agrave: 192, "Agrave;": 192, "Alpha;": 913, "Amacr;": 256, "And;": 10835, "Aogon;": 260, "Aopf;": [55349, 56632], "ApplyFunction;": 8289, Aring: 197, "Aring;": 197, "Ascr;": [55349, 56476], "Assign;": 8788, Atilde: 195, "Atilde;": 195, Auml: 196, "Auml;": 196, "Backslash;": 8726, "Barv;": 10983, "Barwed;": 8966, "Bcy;": 1041, "Because;": 8757, "Bernoullis;": 8492, "Beta;": 914, "Bfr;": [55349, 56581], "Bopf;": [55349, 56633], "Breve;": 728, "Bscr;": 8492, "Bumpeq;": 8782, "CHcy;": 1063, COPY: 169, "COPY;": 169, "Cacute;": 262, "Cap;": 8914, "CapitalDifferentialD;": 8517, "Cayleys;": 8493, "Ccaron;": 268, Ccedil: 199, "Ccedil;": 199, "Ccirc;": 264, "Cconint;": 8752, "Cdot;": 266, "Cedilla;": 184, "CenterDot;": 183, "Cfr;": 8493, "Chi;": 935, "CircleDot;": 8857, "CircleMinus;": 8854, "CirclePlus;": 8853, "CircleTimes;": 8855, "ClockwiseContourIntegral;": 8754, "CloseCurlyDoubleQuote;": 8221, "CloseCurlyQuote;": 8217, "Colon;": 8759, "Colone;": 10868, "Congruent;": 8801, "Conint;": 8751, "ContourIntegral;": 8750, "Copf;": 8450, "Coproduct;": 8720, "CounterClockwiseContourIntegral;": 8755, "Cross;": 10799, "Cscr;": [55349, 56478], "Cup;": 8915, "CupCap;": 8781, "DD;": 8517, "DDotrahd;": 10513, "DJcy;": 1026, "DScy;": 1029, "DZcy;": 1039, "Dagger;": 8225, "Darr;": 8609, "Dashv;": 10980, "Dcaron;": 270, "Dcy;": 1044, "Del;": 8711, "Delta;": 916, "Dfr;": [55349, 56583], "DiacriticalAcute;": 180, "DiacriticalDot;": 729, "DiacriticalDoubleAcute;": 733, "DiacriticalGrave;": 96, "DiacriticalTilde;": 732, "Diamond;": 8900, "DifferentialD;": 8518, "Dopf;": [55349, 56635], "Dot;": 168, "DotDot;": 8412, "DotEqual;": 8784, "DoubleContourIntegral;": 8751, "DoubleDot;": 168, "DoubleDownArrow;": 8659, "DoubleLeftArrow;": 8656, "DoubleLeftRightArrow;": 8660, "DoubleLeftTee;": 10980, "DoubleLongLeftArrow;": 10232, "DoubleLongLeftRightArrow;": 10234, "DoubleLongRightArrow;": 10233, "DoubleRightArrow;": 8658, "DoubleRightTee;": 8872, "DoubleUpArrow;": 8657, "DoubleUpDownArrow;": 8661, "DoubleVerticalBar;": 8741, "DownArrow;": 8595, "DownArrowBar;": 10515, "DownArrowUpArrow;": 8693, "DownBreve;": 785, "DownLeftRightVector;": 10576, "DownLeftTeeVector;": 10590, "DownLeftVector;": 8637, "DownLeftVectorBar;": 10582, "DownRightTeeVector;": 10591, "DownRightVector;": 8641, "DownRightVectorBar;": 10583, "DownTee;": 8868, "DownTeeArrow;": 8615, "Downarrow;": 8659, "Dscr;": [55349, 56479], "Dstrok;": 272, "ENG;": 330, ETH: 208, "ETH;": 208, Eacute: 201, "Eacute;": 201, "Ecaron;": 282, Ecirc: 202, "Ecirc;": 202, "Ecy;": 1069, "Edot;": 278, "Efr;": [55349, 56584], Egrave: 200, "Egrave;": 200, "Element;": 8712, "Emacr;": 274, "EmptySmallSquare;": 9723, "EmptyVerySmallSquare;": 9643, "Eogon;": 280, "Eopf;": [55349, 56636], "Epsilon;": 917, "Equal;": 10869, "EqualTilde;": 8770, "Equilibrium;": 8652, "Escr;": 8496, "Esim;": 10867, "Eta;": 919, Euml: 203, "Euml;": 203, "Exists;": 8707, "ExponentialE;": 8519, "Fcy;": 1060, "Ffr;": [55349, 56585], "FilledSmallSquare;": 9724, "FilledVerySmallSquare;": 9642, "Fopf;": [55349, 56637], "ForAll;": 8704, "Fouriertrf;": 8497, "Fscr;": 8497, "GJcy;": 1027, GT: 62, "GT;": 62, "Gamma;": 915, "Gammad;": 988, "Gbreve;": 286, "Gcedil;": 290, "Gcirc;": 284, "Gcy;": 1043, "Gdot;": 288, "Gfr;": [55349, 56586], "Gg;": 8921, "Gopf;": [55349, 56638], "GreaterEqual;": 8805, "GreaterEqualLess;": 8923, "GreaterFullEqual;": 8807, "GreaterGreater;": 10914, "GreaterLess;": 8823, "GreaterSlantEqual;": 10878, "GreaterTilde;": 8819, "Gscr;": [55349, 56482], "Gt;": 8811, "HARDcy;": 1066, "Hacek;": 711, "Hat;": 94, "Hcirc;": 292, "Hfr;": 8460, "HilbertSpace;": 8459, "Hopf;": 8461, "HorizontalLine;": 9472, "Hscr;": 8459, "Hstrok;": 294, "HumpDownHump;": 8782, "HumpEqual;": 8783, "IEcy;": 1045, "IJlig;": 306, "IOcy;": 1025, Iacute: 205, "Iacute;": 205, Icirc: 206, "Icirc;": 206, "Icy;": 1048, "Idot;": 304, "Ifr;": 8465, Igrave: 204, "Igrave;": 204, "Im;": 8465, "Imacr;": 298, "ImaginaryI;": 8520, "Implies;": 8658, "Int;": 8748, "Integral;": 8747, "Intersection;": 8898, "InvisibleComma;": 8291, "InvisibleTimes;": 8290, "Iogon;": 302, "Iopf;": [55349, 56640], "Iota;": 921, "Iscr;": 8464, "Itilde;": 296, "Iukcy;": 1030, Iuml: 207, "Iuml;": 207, "Jcirc;": 308, "Jcy;": 1049, "Jfr;": [55349, 56589], "Jopf;": [55349, 56641], "Jscr;": [55349, 56485], "Jsercy;": 1032, "Jukcy;": 1028, "KHcy;": 1061, "KJcy;": 1036, "Kappa;": 922, "Kcedil;": 310, "Kcy;": 1050, "Kfr;": [55349, 56590], "Kopf;": [55349, 56642], "Kscr;": [55349, 56486], "LJcy;": 1033, LT: 60, "LT;": 60, "Lacute;": 313, "Lambda;": 923, "Lang;": 10218, "Laplacetrf;": 8466, "Larr;": 8606, "Lcaron;": 317, "Lcedil;": 315, "Lcy;": 1051, "LeftAngleBracket;": 10216, "LeftArrow;": 8592, "LeftArrowBar;": 8676, "LeftArrowRightArrow;": 8646, "LeftCeiling;": 8968, "LeftDoubleBracket;": 10214, "LeftDownTeeVector;": 10593, "LeftDownVector;": 8643, "LeftDownVectorBar;": 10585, "LeftFloor;": 8970, "LeftRightArrow;": 8596, "LeftRightVector;": 10574, "LeftTee;": 8867, "LeftTeeArrow;": 8612, "LeftTeeVector;": 10586, "LeftTriangle;": 8882, "LeftTriangleBar;": 10703, "LeftTriangleEqual;": 8884, "LeftUpDownVector;": 10577, "LeftUpTeeVector;": 10592, "LeftUpVector;": 8639, "LeftUpVectorBar;": 10584, "LeftVector;": 8636, "LeftVectorBar;": 10578, "Leftarrow;": 8656, "Leftrightarrow;": 8660, "LessEqualGreater;": 8922, "LessFullEqual;": 8806, "LessGreater;": 8822, "LessLess;": 10913, "LessSlantEqual;": 10877, "LessTilde;": 8818, "Lfr;": [55349, 56591], "Ll;": 8920, "Lleftarrow;": 8666, "Lmidot;": 319, "LongLeftArrow;": 10229, "LongLeftRightArrow;": 10231, "LongRightArrow;": 10230, "Longleftarrow;": 10232, "Longleftrightarrow;": 10234, "Longrightarrow;": 10233, "Lopf;": [55349, 56643], "LowerLeftArrow;": 8601, "LowerRightArrow;": 8600, "Lscr;": 8466, "Lsh;": 8624, "Lstrok;": 321, "Lt;": 8810, "Map;": 10501, "Mcy;": 1052, "MediumSpace;": 8287, "Mellintrf;": 8499, "Mfr;": [55349, 56592], "MinusPlus;": 8723, "Mopf;": [55349, 56644], "Mscr;": 8499, "Mu;": 924, "NJcy;": 1034, "Nacute;": 323, "Ncaron;": 327, "Ncedil;": 325, "Ncy;": 1053, "NegativeMediumSpace;": 8203, "NegativeThickSpace;": 8203, "NegativeThinSpace;": 8203, "NegativeVeryThinSpace;": 8203, "NestedGreaterGreater;": 8811, "NestedLessLess;": 8810, "NewLine;": 10, "Nfr;": [55349, 56593], "NoBreak;": 8288, "NonBreakingSpace;": 160, "Nopf;": 8469, "Not;": 10988, "NotCongruent;": 8802, "NotCupCap;": 8813, "NotDoubleVerticalBar;": 8742, "NotElement;": 8713, "NotEqual;": 8800, "NotEqualTilde;": [8770, 824], "NotExists;": 8708, "NotGreater;": 8815, "NotGreaterEqual;": 8817, "NotGreaterFullEqual;": [8807, 824], "NotGreaterGreater;": [8811, 824], "NotGreaterLess;": 8825, "NotGreaterSlantEqual;": [10878, 824], "NotGreaterTilde;": 8821, "NotHumpDownHump;": [8782, 824], "NotHumpEqual;": [8783, 824], "NotLeftTriangle;": 8938, "NotLeftTriangleBar;": [10703, 824], "NotLeftTriangleEqual;": 8940, "NotLess;": 8814, "NotLessEqual;": 8816, "NotLessGreater;": 8824, "NotLessLess;": [8810, 824], "NotLessSlantEqual;": [10877, 824], "NotLessTilde;": 8820, "NotNestedGreaterGreater;": [10914, 824], "NotNestedLessLess;": [10913, 824], "NotPrecedes;": 8832, "NotPrecedesEqual;": [10927, 824], "NotPrecedesSlantEqual;": 8928, "NotReverseElement;": 8716, "NotRightTriangle;": 8939, "NotRightTriangleBar;": [10704, 824], "NotRightTriangleEqual;": 8941, "NotSquareSubset;": [8847, 824], "NotSquareSubsetEqual;": 8930, "NotSquareSuperset;": [8848, 824], "NotSquareSupersetEqual;": 8931, "NotSubset;": [8834, 8402], "NotSubsetEqual;": 8840, "NotSucceeds;": 8833, "NotSucceedsEqual;": [10928, 824], "NotSucceedsSlantEqual;": 8929, "NotSucceedsTilde;": [8831, 824], "NotSuperset;": [8835, 8402], "NotSupersetEqual;": 8841, "NotTilde;": 8769, "NotTildeEqual;": 8772, "NotTildeFullEqual;": 8775, "NotTildeTilde;": 8777, "NotVerticalBar;": 8740, "Nscr;": [55349, 56489], Ntilde: 209, "Ntilde;": 209, "Nu;": 925, "OElig;": 338, Oacute: 211, "Oacute;": 211, Ocirc: 212, "Ocirc;": 212, "Ocy;": 1054, "Odblac;": 336, "Ofr;": [55349, 56594], Ograve: 210, "Ograve;": 210, "Omacr;": 332, "Omega;": 937, "Omicron;": 927, "Oopf;": [55349, 56646], "OpenCurlyDoubleQuote;": 8220, "OpenCurlyQuote;": 8216, "Or;": 10836, "Oscr;": [55349, 56490], Oslash: 216, "Oslash;": 216, Otilde: 213, "Otilde;": 213, "Otimes;": 10807, Ouml: 214, "Ouml;": 214, "OverBar;": 8254, "OverBrace;": 9182, "OverBracket;": 9140, "OverParenthesis;": 9180, "PartialD;": 8706, "Pcy;": 1055, "Pfr;": [55349, 56595], "Phi;": 934, "Pi;": 928, "PlusMinus;": 177, "Poincareplane;": 8460, "Popf;": 8473, "Pr;": 10939, "Precedes;": 8826, "PrecedesEqual;": 10927, "PrecedesSlantEqual;": 8828, "PrecedesTilde;": 8830, "Prime;": 8243, "Product;": 8719, "Proportion;": 8759, "Proportional;": 8733, "Pscr;": [55349, 56491], "Psi;": 936, QUOT: 34, "QUOT;": 34, "Qfr;": [55349, 56596], "Qopf;": 8474, "Qscr;": [55349, 56492], "RBarr;": 10512, REG: 174, "REG;": 174, "Racute;": 340, "Rang;": 10219, "Rarr;": 8608, "Rarrtl;": 10518, "Rcaron;": 344, "Rcedil;": 342, "Rcy;": 1056, "Re;": 8476, "ReverseElement;": 8715, "ReverseEquilibrium;": 8651, "ReverseUpEquilibrium;": 10607, "Rfr;": 8476, "Rho;": 929, "RightAngleBracket;": 10217, "RightArrow;": 8594, "RightArrowBar;": 8677, "RightArrowLeftArrow;": 8644, "RightCeiling;": 8969, "RightDoubleBracket;": 10215, "RightDownTeeVector;": 10589, "RightDownVector;": 8642, "RightDownVectorBar;": 10581, "RightFloor;": 8971, "RightTee;": 8866, "RightTeeArrow;": 8614, "RightTeeVector;": 10587, "RightTriangle;": 8883, "RightTriangleBar;": 10704, "RightTriangleEqual;": 8885, "RightUpDownVector;": 10575, "RightUpTeeVector;": 10588, "RightUpVector;": 8638, "RightUpVectorBar;": 10580, "RightVector;": 8640, "RightVectorBar;": 10579, "Rightarrow;": 8658, "Ropf;": 8477, "RoundImplies;": 10608, "Rrightarrow;": 8667, "Rscr;": 8475, "Rsh;": 8625, "RuleDelayed;": 10740, "SHCHcy;": 1065, "SHcy;": 1064, "SOFTcy;": 1068, "Sacute;": 346, "Sc;": 10940, "Scaron;": 352, "Scedil;": 350, "Scirc;": 348, "Scy;": 1057, "Sfr;": [55349, 56598], "ShortDownArrow;": 8595, "ShortLeftArrow;": 8592, "ShortRightArrow;": 8594, "ShortUpArrow;": 8593, "Sigma;": 931, "SmallCircle;": 8728, "Sopf;": [55349, 56650], "Sqrt;": 8730, "Square;": 9633, "SquareIntersection;": 8851, "SquareSubset;": 8847, "SquareSubsetEqual;": 8849, "SquareSuperset;": 8848, "SquareSupersetEqual;": 8850, "SquareUnion;": 8852, "Sscr;": [55349, 56494], "Star;": 8902, "Sub;": 8912, "Subset;": 8912, "SubsetEqual;": 8838, "Succeeds;": 8827, "SucceedsEqual;": 10928, "SucceedsSlantEqual;": 8829, "SucceedsTilde;": 8831, "SuchThat;": 8715, "Sum;": 8721, "Sup;": 8913, "Superset;": 8835, "SupersetEqual;": 8839, "Supset;": 8913, THORN: 222, "THORN;": 222, "TRADE;": 8482, "TSHcy;": 1035, "TScy;": 1062, "Tab;": 9, "Tau;": 932, "Tcaron;": 356, "Tcedil;": 354, "Tcy;": 1058, "Tfr;": [55349, 56599], "Therefore;": 8756, "Theta;": 920, "ThickSpace;": [8287, 8202], "ThinSpace;": 8201, "Tilde;": 8764, "TildeEqual;": 8771, "TildeFullEqual;": 8773, "TildeTilde;": 8776, "Topf;": [55349, 56651], "TripleDot;": 8411, "Tscr;": [55349, 56495], "Tstrok;": 358, Uacute: 218, "Uacute;": 218, "Uarr;": 8607, "Uarrocir;": 10569, "Ubrcy;": 1038, "Ubreve;": 364, Ucirc: 219, "Ucirc;": 219, "Ucy;": 1059, "Udblac;": 368, "Ufr;": [55349, 56600], Ugrave: 217, "Ugrave;": 217, "Umacr;": 362, "UnderBar;": 95, "UnderBrace;": 9183, "UnderBracket;": 9141, "UnderParenthesis;": 9181, "Union;": 8899, "UnionPlus;": 8846, "Uogon;": 370, "Uopf;": [55349, 56652], "UpArrow;": 8593, "UpArrowBar;": 10514, "UpArrowDownArrow;": 8645, "UpDownArrow;": 8597, "UpEquilibrium;": 10606, "UpTee;": 8869, "UpTeeArrow;": 8613, "Uparrow;": 8657, "Updownarrow;": 8661, "UpperLeftArrow;": 8598, "UpperRightArrow;": 8599, "Upsi;": 978, "Upsilon;": 933, "Uring;": 366, "Uscr;": [55349, 56496], "Utilde;": 360, Uuml: 220, "Uuml;": 220, "VDash;": 8875, "Vbar;": 10987, "Vcy;": 1042, "Vdash;": 8873, "Vdashl;": 10982, "Vee;": 8897, "Verbar;": 8214, "Vert;": 8214, "VerticalBar;": 8739, "VerticalLine;": 124, "VerticalSeparator;": 10072, "VerticalTilde;": 8768, "VeryThinSpace;": 8202, "Vfr;": [55349, 56601], "Vopf;": [55349, 56653], "Vscr;": [55349, 56497], "Vvdash;": 8874, "Wcirc;": 372, "Wedge;": 8896, "Wfr;": [55349, 56602], "Wopf;": [55349, 56654], "Wscr;": [55349, 56498], "Xfr;": [55349, 56603], "Xi;": 926, "Xopf;": [55349, 56655], "Xscr;": [55349, 56499], "YAcy;": 1071, "YIcy;": 1031, "YUcy;": 1070, Yacute: 221, "Yacute;": 221, "Ycirc;": 374, "Ycy;": 1067, "Yfr;": [55349, 56604], "Yopf;": [55349, 56656], "Yscr;": [55349, 56500], "Yuml;": 376, "ZHcy;": 1046, "Zacute;": 377, "Zcaron;": 381, "Zcy;": 1047, "Zdot;": 379, "ZeroWidthSpace;": 8203, "Zeta;": 918, "Zfr;": 8488, "Zopf;": 8484, "Zscr;": [55349, 56501], aacute: 225, "aacute;": 225, "abreve;": 259, "ac;": 8766, "acE;": [8766, 819], "acd;": 8767, acirc: 226, "acirc;": 226, acute: 180, "acute;": 180, "acy;": 1072, aelig: 230, "aelig;": 230, "af;": 8289, "afr;": [55349, 56606], agrave: 224, "agrave;": 224, "alefsym;": 8501, "aleph;": 8501, "alpha;": 945, "amacr;": 257, "amalg;": 10815, amp: 38, "amp;": 38, "and;": 8743, "andand;": 10837, "andd;": 10844, "andslope;": 10840, "andv;": 10842, "ang;": 8736, "ange;": 10660, "angle;": 8736, "angmsd;": 8737, "angmsdaa;": 10664, "angmsdab;": 10665, "angmsdac;": 10666, "angmsdad;": 10667, "angmsdae;": 10668, "angmsdaf;": 10669, "angmsdag;": 10670, "angmsdah;": 10671, "angrt;": 8735, "angrtvb;": 8894, "angrtvbd;": 10653, "angsph;": 8738, "angst;": 197, "angzarr;": 9084, "aogon;": 261, "aopf;": [55349, 56658], "ap;": 8776, "apE;": 10864, "apacir;": 10863, "ape;": 8778, "apid;": 8779, "apos;": 39, "approx;": 8776, "approxeq;": 8778, aring: 229, "aring;": 229, "ascr;": [55349, 56502], "ast;": 42, "asymp;": 8776, "asympeq;": 8781, atilde: 227, "atilde;": 227, auml: 228, "auml;": 228, "awconint;": 8755, "awint;": 10769, "bNot;": 10989, "backcong;": 8780, "backepsilon;": 1014, "backprime;": 8245, "backsim;": 8765, "backsimeq;": 8909, "barvee;": 8893, "barwed;": 8965, "barwedge;": 8965, "bbrk;": 9141, "bbrktbrk;": 9142, "bcong;": 8780, "bcy;": 1073, "bdquo;": 8222, "becaus;": 8757, "because;": 8757, "bemptyv;": 10672, "bepsi;": 1014, "bernou;": 8492, "beta;": 946, "beth;": 8502, "between;": 8812, "bfr;": [55349, 56607], "bigcap;": 8898, "bigcirc;": 9711, "bigcup;": 8899, "bigodot;": 10752, "bigoplus;": 10753, "bigotimes;": 10754, "bigsqcup;": 10758, "bigstar;": 9733, "bigtriangledown;": 9661, "bigtriangleup;": 9651, "biguplus;": 10756, "bigvee;": 8897, "bigwedge;": 8896, "bkarow;": 10509, "blacklozenge;": 10731, "blacksquare;": 9642, "blacktriangle;": 9652, "blacktriangledown;": 9662, "blacktriangleleft;": 9666, "blacktriangleright;": 9656, "blank;": 9251, "blk12;": 9618, "blk14;": 9617, "blk34;": 9619, "block;": 9608, "bne;": [61, 8421], "bnequiv;": [8801, 8421], "bnot;": 8976, "bopf;": [55349, 56659], "bot;": 8869, "bottom;": 8869, "bowtie;": 8904, "boxDL;": 9559, "boxDR;": 9556, "boxDl;": 9558, "boxDr;": 9555, "boxH;": 9552, "boxHD;": 9574, "boxHU;": 9577, "boxHd;": 9572, "boxHu;": 9575, "boxUL;": 9565, "boxUR;": 9562, "boxUl;": 9564, "boxUr;": 9561, "boxV;": 9553, "boxVH;": 9580, "boxVL;": 9571, "boxVR;": 9568, "boxVh;": 9579, "boxVl;": 9570, "boxVr;": 9567, "boxbox;": 10697, "boxdL;": 9557, "boxdR;": 9554, "boxdl;": 9488, "boxdr;": 9484, "boxh;": 9472, "boxhD;": 9573, "boxhU;": 9576, "boxhd;": 9516, "boxhu;": 9524, "boxminus;": 8863, "boxplus;": 8862, "boxtimes;": 8864, "boxuL;": 9563, "boxuR;": 9560, "boxul;": 9496, "boxur;": 9492, "boxv;": 9474, "boxvH;": 9578, "boxvL;": 9569, "boxvR;": 9566, "boxvh;": 9532, "boxvl;": 9508, "boxvr;": 9500, "bprime;": 8245, "breve;": 728, brvbar: 166, "brvbar;": 166, "bscr;": [55349, 56503], "bsemi;": 8271, "bsim;": 8765, "bsime;": 8909, "bsol;": 92, "bsolb;": 10693, "bsolhsub;": 10184, "bull;": 8226, "bullet;": 8226, "bump;": 8782, "bumpE;": 10926, "bumpe;": 8783, "bumpeq;": 8783, "cacute;": 263, "cap;": 8745, "capand;": 10820, "capbrcup;": 10825, "capcap;": 10827, "capcup;": 10823, "capdot;": 10816, "caps;": [8745, 65024], "caret;": 8257, "caron;": 711, "ccaps;": 10829, "ccaron;": 269, ccedil: 231, "ccedil;": 231, "ccirc;": 265, "ccups;": 10828, "ccupssm;": 10832, "cdot;": 267, cedil: 184, "cedil;": 184, "cemptyv;": 10674, cent: 162, "cent;": 162, "centerdot;": 183, "cfr;": [55349, 56608], "chcy;": 1095, "check;": 10003, "checkmark;": 10003, "chi;": 967, "cir;": 9675, "cirE;": 10691, "circ;": 710, "circeq;": 8791, "circlearrowleft;": 8634, "circlearrowright;": 8635, "circledR;": 174, "circledS;": 9416, "circledast;": 8859, "circledcirc;": 8858, "circleddash;": 8861, "cire;": 8791, "cirfnint;": 10768, "cirmid;": 10991, "cirscir;": 10690, "clubs;": 9827, "clubsuit;": 9827, "colon;": 58, "colone;": 8788, "coloneq;": 8788, "comma;": 44, "commat;": 64, "comp;": 8705, "compfn;": 8728, "complement;": 8705, "complexes;": 8450, "cong;": 8773, "congdot;": 10861, "conint;": 8750, "copf;": [55349, 56660], "coprod;": 8720, copy: 169, "copy;": 169, "copysr;": 8471, "crarr;": 8629, "cross;": 10007, "cscr;": [55349, 56504], "csub;": 10959, "csube;": 10961, "csup;": 10960, "csupe;": 10962, "ctdot;": 8943, "cudarrl;": 10552, "cudarrr;": 10549, "cuepr;": 8926, "cuesc;": 8927, "cularr;": 8630, "cularrp;": 10557, "cup;": 8746, "cupbrcap;": 10824, "cupcap;": 10822, "cupcup;": 10826, "cupdot;": 8845, "cupor;": 10821, "cups;": [8746, 65024], "curarr;": 8631, "curarrm;": 10556, "curlyeqprec;": 8926, "curlyeqsucc;": 8927, "curlyvee;": 8910, "curlywedge;": 8911, curren: 164, "curren;": 164, "curvearrowleft;": 8630, "curvearrowright;": 8631, "cuvee;": 8910, "cuwed;": 8911, "cwconint;": 8754, "cwint;": 8753, "cylcty;": 9005, "dArr;": 8659, "dHar;": 10597, "dagger;": 8224, "daleth;": 8504, "darr;": 8595, "dash;": 8208, "dashv;": 8867, "dbkarow;": 10511, "dblac;": 733, "dcaron;": 271, "dcy;": 1076, "dd;": 8518, "ddagger;": 8225, "ddarr;": 8650, "ddotseq;": 10871, deg: 176, "deg;": 176, "delta;": 948, "demptyv;": 10673, "dfisht;": 10623, "dfr;": [55349, 56609], "dharl;": 8643, "dharr;": 8642, "diam;": 8900, "diamond;": 8900, "diamondsuit;": 9830, "diams;": 9830, "die;": 168, "digamma;": 989, "disin;": 8946, "div;": 247, divide: 247, "divide;": 247, "divideontimes;": 8903, "divonx;": 8903, "djcy;": 1106, "dlcorn;": 8990, "dlcrop;": 8973, "dollar;": 36, "dopf;": [55349, 56661], "dot;": 729, "doteq;": 8784, "doteqdot;": 8785, "dotminus;": 8760, "dotplus;": 8724, "dotsquare;": 8865, "doublebarwedge;": 8966, "downarrow;": 8595, "downdownarrows;": 8650, "downharpoonleft;": 8643, "downharpoonright;": 8642, "drbkarow;": 10512, "drcorn;": 8991, "drcrop;": 8972, "dscr;": [55349, 56505], "dscy;": 1109, "dsol;": 10742, "dstrok;": 273, "dtdot;": 8945, "dtri;": 9663, "dtrif;": 9662, "duarr;": 8693, "duhar;": 10607, "dwangle;": 10662, "dzcy;": 1119, "dzigrarr;": 10239, "eDDot;": 10871, "eDot;": 8785, eacute: 233, "eacute;": 233, "easter;": 10862, "ecaron;": 283, "ecir;": 8790, ecirc: 234, "ecirc;": 234, "ecolon;": 8789, "ecy;": 1101, "edot;": 279, "ee;": 8519, "efDot;": 8786, "efr;": [55349, 56610], "eg;": 10906, egrave: 232, "egrave;": 232, "egs;": 10902, "egsdot;": 10904, "el;": 10905, "elinters;": 9191, "ell;": 8467, "els;": 10901, "elsdot;": 10903, "emacr;": 275, "empty;": 8709, "emptyset;": 8709, "emptyv;": 8709, "emsp13;": 8196, "emsp14;": 8197, "emsp;": 8195, "eng;": 331, "ensp;": 8194, "eogon;": 281, "eopf;": [55349, 56662], "epar;": 8917, "eparsl;": 10723, "eplus;": 10865, "epsi;": 949, "epsilon;": 949, "epsiv;": 1013, "eqcirc;": 8790, "eqcolon;": 8789, "eqsim;": 8770, "eqslantgtr;": 10902, "eqslantless;": 10901, "equals;": 61, "equest;": 8799, "equiv;": 8801, "equivDD;": 10872, "eqvparsl;": 10725, "erDot;": 8787, "erarr;": 10609, "escr;": 8495, "esdot;": 8784, "esim;": 8770, "eta;": 951, eth: 240, "eth;": 240, euml: 235, "euml;": 235, "euro;": 8364, "excl;": 33, "exist;": 8707, "expectation;": 8496, "exponentiale;": 8519, "fallingdotseq;": 8786, "fcy;": 1092, "female;": 9792, "ffilig;": 64259, "fflig;": 64256, "ffllig;": 64260, "ffr;": [55349, 56611], "filig;": 64257, "fjlig;": [102, 106], "flat;": 9837, "fllig;": 64258, "fltns;": 9649, "fnof;": 402, "fopf;": [55349, 56663], "forall;": 8704, "fork;": 8916, "forkv;": 10969, "fpartint;": 10765, frac12: 189, "frac12;": 189, "frac13;": 8531, frac14: 188, "frac14;": 188, "frac15;": 8533, "frac16;": 8537, "frac18;": 8539, "frac23;": 8532, "frac25;": 8534, frac34: 190, "frac34;": 190, "frac35;": 8535, "frac38;": 8540, "frac45;": 8536, "frac56;": 8538, "frac58;": 8541, "frac78;": 8542, "frasl;": 8260, "frown;": 8994, "fscr;": [55349, 56507], "gE;": 8807, "gEl;": 10892, "gacute;": 501, "gamma;": 947, "gammad;": 989, "gap;": 10886, "gbreve;": 287, "gcirc;": 285, "gcy;": 1075, "gdot;": 289, "ge;": 8805, "gel;": 8923, "geq;": 8805, "geqq;": 8807, "geqslant;": 10878, "ges;": 10878, "gescc;": 10921, "gesdot;": 10880, "gesdoto;": 10882, "gesdotol;": 10884, "gesl;": [8923, 65024], "gesles;": 10900, "gfr;": [55349, 56612], "gg;": 8811, "ggg;": 8921, "gimel;": 8503, "gjcy;": 1107, "gl;": 8823, "glE;": 10898, "gla;": 10917, "glj;": 10916, "gnE;": 8809, "gnap;": 10890, "gnapprox;": 10890, "gne;": 10888, "gneq;": 10888, "gneqq;": 8809, "gnsim;": 8935, "gopf;": [55349, 56664], "grave;": 96, "gscr;": 8458, "gsim;": 8819, "gsime;": 10894, "gsiml;": 10896, gt: 62, "gt;": 62, "gtcc;": 10919, "gtcir;": 10874, "gtdot;": 8919, "gtlPar;": 10645, "gtquest;": 10876, "gtrapprox;": 10886, "gtrarr;": 10616, "gtrdot;": 8919, "gtreqless;": 8923, "gtreqqless;": 10892, "gtrless;": 8823, "gtrsim;": 8819, "gvertneqq;": [8809, 65024], "gvnE;": [8809, 65024], "hArr;": 8660, "hairsp;": 8202, "half;": 189, "hamilt;": 8459, "hardcy;": 1098, "harr;": 8596, "harrcir;": 10568, "harrw;": 8621, "hbar;": 8463, "hcirc;": 293, "hearts;": 9829, "heartsuit;": 9829, "hellip;": 8230, "hercon;": 8889, "hfr;": [55349, 56613], "hksearow;": 10533, "hkswarow;": 10534, "hoarr;": 8703, "homtht;": 8763, "hookleftarrow;": 8617, "hookrightarrow;": 8618, "hopf;": [55349, 56665], "horbar;": 8213, "hscr;": [55349, 56509], "hslash;": 8463, "hstrok;": 295, "hybull;": 8259, "hyphen;": 8208, iacute: 237, "iacute;": 237, "ic;": 8291, icirc: 238, "icirc;": 238, "icy;": 1080, "iecy;": 1077, iexcl: 161, "iexcl;": 161, "iff;": 8660, "ifr;": [55349, 56614], igrave: 236, "igrave;": 236, "ii;": 8520, "iiiint;": 10764, "iiint;": 8749, "iinfin;": 10716, "iiota;": 8489, "ijlig;": 307, "imacr;": 299, "image;": 8465, "imagline;": 8464, "imagpart;": 8465, "imath;": 305, "imof;": 8887, "imped;": 437, "in;": 8712, "incare;": 8453, "infin;": 8734, "infintie;": 10717, "inodot;": 305, "int;": 8747, "intcal;": 8890, "integers;": 8484, "intercal;": 8890, "intlarhk;": 10775, "intprod;": 10812, "iocy;": 1105, "iogon;": 303, "iopf;": [55349, 56666], "iota;": 953, "iprod;": 10812, iquest: 191, "iquest;": 191, "iscr;": [55349, 56510], "isin;": 8712, "isinE;": 8953, "isindot;": 8949, "isins;": 8948, "isinsv;": 8947, "isinv;": 8712, "it;": 8290, "itilde;": 297, "iukcy;": 1110, iuml: 239, "iuml;": 239, "jcirc;": 309, "jcy;": 1081, "jfr;": [55349, 56615], "jmath;": 567, "jopf;": [55349, 56667], "jscr;": [55349, 56511], "jsercy;": 1112, "jukcy;": 1108, "kappa;": 954, "kappav;": 1008, "kcedil;": 311, "kcy;": 1082, "kfr;": [55349, 56616], "kgreen;": 312, "khcy;": 1093, "kjcy;": 1116, "kopf;": [55349, 56668], "kscr;": [55349, 56512], "lAarr;": 8666, "lArr;": 8656, "lAtail;": 10523, "lBarr;": 10510, "lE;": 8806, "lEg;": 10891, "lHar;": 10594, "lacute;": 314, "laemptyv;": 10676, "lagran;": 8466, "lambda;": 955, "lang;": 10216, "langd;": 10641, "langle;": 10216, "lap;": 10885, laquo: 171, "laquo;": 171, "larr;": 8592, "larrb;": 8676, "larrbfs;": 10527, "larrfs;": 10525, "larrhk;": 8617, "larrlp;": 8619, "larrpl;": 10553, "larrsim;": 10611, "larrtl;": 8610, "lat;": 10923, "latail;": 10521, "late;": 10925, "lates;": [10925, 65024], "lbarr;": 10508, "lbbrk;": 10098, "lbrace;": 123, "lbrack;": 91, "lbrke;": 10635, "lbrksld;": 10639, "lbrkslu;": 10637, "lcaron;": 318, "lcedil;": 316, "lceil;": 8968, "lcub;": 123, "lcy;": 1083, "ldca;": 10550, "ldquo;": 8220, "ldquor;": 8222, "ldrdhar;": 10599, "ldrushar;": 10571, "ldsh;": 8626, "le;": 8804, "leftarrow;": 8592, "leftarrowtail;": 8610, "leftharpoondown;": 8637, "leftharpoonup;": 8636, "leftleftarrows;": 8647, "leftrightarrow;": 8596, "leftrightarrows;": 8646, "leftrightharpoons;": 8651, "leftrightsquigarrow;": 8621, "leftthreetimes;": 8907, "leg;": 8922, "leq;": 8804, "leqq;": 8806, "leqslant;": 10877, "les;": 10877, "lescc;": 10920, "lesdot;": 10879, "lesdoto;": 10881, "lesdotor;": 10883, "lesg;": [8922, 65024], "lesges;": 10899, "lessapprox;": 10885, "lessdot;": 8918, "lesseqgtr;": 8922, "lesseqqgtr;": 10891, "lessgtr;": 8822, "lesssim;": 8818, "lfisht;": 10620, "lfloor;": 8970, "lfr;": [55349, 56617], "lg;": 8822, "lgE;": 10897, "lhard;": 8637, "lharu;": 8636, "lharul;": 10602, "lhblk;": 9604, "ljcy;": 1113, "ll;": 8810, "llarr;": 8647, "llcorner;": 8990, "llhard;": 10603, "lltri;": 9722, "lmidot;": 320, "lmoust;": 9136, "lmoustache;": 9136, "lnE;": 8808, "lnap;": 10889, "lnapprox;": 10889, "lne;": 10887, "lneq;": 10887, "lneqq;": 8808, "lnsim;": 8934, "loang;": 10220, "loarr;": 8701, "lobrk;": 10214, "longleftarrow;": 10229, "longleftrightarrow;": 10231, "longmapsto;": 10236, "longrightarrow;": 10230, "looparrowleft;": 8619, "looparrowright;": 8620, "lopar;": 10629, "lopf;": [55349, 56669], "loplus;": 10797, "lotimes;": 10804, "lowast;": 8727, "lowbar;": 95, "loz;": 9674, "lozenge;": 9674, "lozf;": 10731, "lpar;": 40, "lparlt;": 10643, "lrarr;": 8646, "lrcorner;": 8991, "lrhar;": 8651, "lrhard;": 10605, "lrm;": 8206, "lrtri;": 8895, "lsaquo;": 8249, "lscr;": [55349, 56513], "lsh;": 8624, "lsim;": 8818, "lsime;": 10893, "lsimg;": 10895, "lsqb;": 91, "lsquo;": 8216, "lsquor;": 8218, "lstrok;": 322, lt: 60, "lt;": 60, "ltcc;": 10918, "ltcir;": 10873, "ltdot;": 8918, "lthree;": 8907, "ltimes;": 8905, "ltlarr;": 10614, "ltquest;": 10875, "ltrPar;": 10646, "ltri;": 9667, "ltrie;": 8884, "ltrif;": 9666, "lurdshar;": 10570, "luruhar;": 10598, "lvertneqq;": [8808, 65024], "lvnE;": [8808, 65024], "mDDot;": 8762, macr: 175, "macr;": 175, "male;": 9794, "malt;": 10016, "maltese;": 10016, "map;": 8614, "mapsto;": 8614, "mapstodown;": 8615, "mapstoleft;": 8612, "mapstoup;": 8613, "marker;": 9646, "mcomma;": 10793, "mcy;": 1084, "mdash;": 8212, "measuredangle;": 8737, "mfr;": [55349, 56618], "mho;": 8487, micro: 181, "micro;": 181, "mid;": 8739, "midast;": 42, "midcir;": 10992, middot: 183, "middot;": 183, "minus;": 8722, "minusb;": 8863, "minusd;": 8760, "minusdu;": 10794, "mlcp;": 10971, "mldr;": 8230, "mnplus;": 8723, "models;": 8871, "mopf;": [55349, 56670], "mp;": 8723, "mscr;": [55349, 56514], "mstpos;": 8766, "mu;": 956, "multimap;": 8888, "mumap;": 8888, "nGg;": [8921, 824], "nGt;": [8811, 8402], "nGtv;": [8811, 824], "nLeftarrow;": 8653, "nLeftrightarrow;": 8654, "nLl;": [8920, 824], "nLt;": [8810, 8402], "nLtv;": [8810, 824], "nRightarrow;": 8655, "nVDash;": 8879, "nVdash;": 8878, "nabla;": 8711, "nacute;": 324, "nang;": [8736, 8402], "nap;": 8777, "napE;": [10864, 824], "napid;": [8779, 824], "napos;": 329, "napprox;": 8777, "natur;": 9838, "natural;": 9838, "naturals;": 8469, nbsp: 160, "nbsp;": 160, "nbump;": [8782, 824], "nbumpe;": [8783, 824], "ncap;": 10819, "ncaron;": 328, "ncedil;": 326, "ncong;": 8775, "ncongdot;": [10861, 824], "ncup;": 10818, "ncy;": 1085, "ndash;": 8211, "ne;": 8800, "neArr;": 8663, "nearhk;": 10532, "nearr;": 8599, "nearrow;": 8599, "nedot;": [8784, 824], "nequiv;": 8802, "nesear;": 10536, "nesim;": [8770, 824], "nexist;": 8708, "nexists;": 8708, "nfr;": [55349, 56619], "ngE;": [8807, 824], "nge;": 8817, "ngeq;": 8817, "ngeqq;": [8807, 824], "ngeqslant;": [10878, 824], "nges;": [10878, 824], "ngsim;": 8821, "ngt;": 8815, "ngtr;": 8815, "nhArr;": 8654, "nharr;": 8622, "nhpar;": 10994, "ni;": 8715, "nis;": 8956, "nisd;": 8954, "niv;": 8715, "njcy;": 1114, "nlArr;": 8653, "nlE;": [8806, 824], "nlarr;": 8602, "nldr;": 8229, "nle;": 8816, "nleftarrow;": 8602, "nleftrightarrow;": 8622, "nleq;": 8816, "nleqq;": [8806, 824], "nleqslant;": [10877, 824], "nles;": [10877, 824], "nless;": 8814, "nlsim;": 8820, "nlt;": 8814, "nltri;": 8938, "nltrie;": 8940, "nmid;": 8740, "nopf;": [55349, 56671], not: 172, "not;": 172, "notin;": 8713, "notinE;": [8953, 824], "notindot;": [8949, 824], "notinva;": 8713, "notinvb;": 8951, "notinvc;": 8950, "notni;": 8716, "notniva;": 8716, "notnivb;": 8958, "notnivc;": 8957, "npar;": 8742, "nparallel;": 8742, "nparsl;": [11005, 8421], "npart;": [8706, 824], "npolint;": 10772, "npr;": 8832, "nprcue;": 8928, "npre;": [10927, 824], "nprec;": 8832, "npreceq;": [10927, 824], "nrArr;": 8655, "nrarr;": 8603, "nrarrc;": [10547, 824], "nrarrw;": [8605, 824], "nrightarrow;": 8603, "nrtri;": 8939, "nrtrie;": 8941, "nsc;": 8833, "nsccue;": 8929, "nsce;": [10928, 824], "nscr;": [55349, 56515], "nshortmid;": 8740, "nshortparallel;": 8742, "nsim;": 8769, "nsime;": 8772, "nsimeq;": 8772, "nsmid;": 8740, "nspar;": 8742, "nsqsube;": 8930, "nsqsupe;": 8931, "nsub;": 8836, "nsubE;": [10949, 824], "nsube;": 8840, "nsubset;": [8834, 8402], "nsubseteq;": 8840, "nsubseteqq;": [10949, 824], "nsucc;": 8833, "nsucceq;": [10928, 824], "nsup;": 8837, "nsupE;": [10950, 824], "nsupe;": 8841, "nsupset;": [8835, 8402], "nsupseteq;": 8841, "nsupseteqq;": [10950, 824], "ntgl;": 8825, ntilde: 241, "ntilde;": 241, "ntlg;": 8824, "ntriangleleft;": 8938, "ntrianglelefteq;": 8940, "ntriangleright;": 8939, "ntrianglerighteq;": 8941, "nu;": 957, "num;": 35, "numero;": 8470, "numsp;": 8199, "nvDash;": 8877, "nvHarr;": 10500, "nvap;": [8781, 8402], "nvdash;": 8876, "nvge;": [8805, 8402], "nvgt;": [62, 8402], "nvinfin;": 10718, "nvlArr;": 10498, "nvle;": [8804, 8402], "nvlt;": [60, 8402], "nvltrie;": [8884, 8402], "nvrArr;": 10499, "nvrtrie;": [8885, 8402], "nvsim;": [8764, 8402], "nwArr;": 8662, "nwarhk;": 10531, "nwarr;": 8598, "nwarrow;": 8598, "nwnear;": 10535, "oS;": 9416, oacute: 243, "oacute;": 243, "oast;": 8859, "ocir;": 8858, ocirc: 244, "ocirc;": 244, "ocy;": 1086, "odash;": 8861, "odblac;": 337, "odiv;": 10808, "odot;": 8857, "odsold;": 10684, "oelig;": 339, "ofcir;": 10687, "ofr;": [55349, 56620], "ogon;": 731, ograve: 242, "ograve;": 242, "ogt;": 10689, "ohbar;": 10677, "ohm;": 937, "oint;": 8750, "olarr;": 8634, "olcir;": 10686, "olcross;": 10683, "oline;": 8254, "olt;": 10688, "omacr;": 333, "omega;": 969, "omicron;": 959, "omid;": 10678, "ominus;": 8854, "oopf;": [55349, 56672], "opar;": 10679, "operp;": 10681, "oplus;": 8853, "or;": 8744, "orarr;": 8635, "ord;": 10845, "order;": 8500, "orderof;": 8500, ordf: 170, "ordf;": 170, ordm: 186, "ordm;": 186, "origof;": 8886, "oror;": 10838, "orslope;": 10839, "orv;": 10843, "oscr;": 8500, oslash: 248, "oslash;": 248, "osol;": 8856, otilde: 245, "otilde;": 245, "otimes;": 8855, "otimesas;": 10806, ouml: 246, "ouml;": 246, "ovbar;": 9021, "par;": 8741, para: 182, "para;": 182, "parallel;": 8741, "parsim;": 10995, "parsl;": 11005, "part;": 8706, "pcy;": 1087, "percnt;": 37, "period;": 46, "permil;": 8240, "perp;": 8869, "pertenk;": 8241, "pfr;": [55349, 56621], "phi;": 966, "phiv;": 981, "phmmat;": 8499, "phone;": 9742, "pi;": 960, "pitchfork;": 8916, "piv;": 982, "planck;": 8463, "planckh;": 8462, "plankv;": 8463, "plus;": 43, "plusacir;": 10787, "plusb;": 8862, "pluscir;": 10786, "plusdo;": 8724, "plusdu;": 10789, "pluse;": 10866, plusmn: 177, "plusmn;": 177, "plussim;": 10790, "plustwo;": 10791, "pm;": 177, "pointint;": 10773, "popf;": [55349, 56673], pound: 163, "pound;": 163, "pr;": 8826, "prE;": 10931, "prap;": 10935, "prcue;": 8828, "pre;": 10927, "prec;": 8826, "precapprox;": 10935, "preccurlyeq;": 8828, "preceq;": 10927, "precnapprox;": 10937, "precneqq;": 10933, "precnsim;": 8936, "precsim;": 8830, "prime;": 8242, "primes;": 8473, "prnE;": 10933, "prnap;": 10937, "prnsim;": 8936, "prod;": 8719, "profalar;": 9006, "profline;": 8978, "profsurf;": 8979, "prop;": 8733, "propto;": 8733, "prsim;": 8830, "prurel;": 8880, "pscr;": [55349, 56517], "psi;": 968, "puncsp;": 8200, "qfr;": [55349, 56622], "qint;": 10764, "qopf;": [55349, 56674], "qprime;": 8279, "qscr;": [55349, 56518], "quaternions;": 8461, "quatint;": 10774, "quest;": 63, "questeq;": 8799, quot: 34, "quot;": 34, "rAarr;": 8667, "rArr;": 8658, "rAtail;": 10524, "rBarr;": 10511, "rHar;": 10596, "race;": [8765, 817], "racute;": 341, "radic;": 8730, "raemptyv;": 10675, "rang;": 10217, "rangd;": 10642, "range;": 10661, "rangle;": 10217, raquo: 187, "raquo;": 187, "rarr;": 8594, "rarrap;": 10613, "rarrb;": 8677, "rarrbfs;": 10528, "rarrc;": 10547, "rarrfs;": 10526, "rarrhk;": 8618, "rarrlp;": 8620, "rarrpl;": 10565, "rarrsim;": 10612, "rarrtl;": 8611, "rarrw;": 8605, "ratail;": 10522, "ratio;": 8758, "rationals;": 8474, "rbarr;": 10509, "rbbrk;": 10099, "rbrace;": 125, "rbrack;": 93, "rbrke;": 10636, "rbrksld;": 10638, "rbrkslu;": 10640, "rcaron;": 345, "rcedil;": 343, "rceil;": 8969, "rcub;": 125, "rcy;": 1088, "rdca;": 10551, "rdldhar;": 10601, "rdquo;": 8221, "rdquor;": 8221, "rdsh;": 8627, "real;": 8476, "realine;": 8475, "realpart;": 8476, "reals;": 8477, "rect;": 9645, reg: 174, "reg;": 174, "rfisht;": 10621, "rfloor;": 8971, "rfr;": [55349, 56623], "rhard;": 8641, "rharu;": 8640, "rharul;": 10604, "rho;": 961, "rhov;": 1009, "rightarrow;": 8594, "rightarrowtail;": 8611, "rightharpoondown;": 8641, "rightharpoonup;": 8640, "rightleftarrows;": 8644, "rightleftharpoons;": 8652, "rightrightarrows;": 8649, "rightsquigarrow;": 8605, "rightthreetimes;": 8908, "ring;": 730, "risingdotseq;": 8787, "rlarr;": 8644, "rlhar;": 8652, "rlm;": 8207, "rmoust;": 9137, "rmoustache;": 9137, "rnmid;": 10990, "roang;": 10221, "roarr;": 8702, "robrk;": 10215, "ropar;": 10630, "ropf;": [55349, 56675], "roplus;": 10798, "rotimes;": 10805, "rpar;": 41, "rpargt;": 10644, "rppolint;": 10770, "rrarr;": 8649, "rsaquo;": 8250, "rscr;": [55349, 56519], "rsh;": 8625, "rsqb;": 93, "rsquo;": 8217, "rsquor;": 8217, "rthree;": 8908, "rtimes;": 8906, "rtri;": 9657, "rtrie;": 8885, "rtrif;": 9656, "rtriltri;": 10702, "ruluhar;": 10600, "rx;": 8478, "sacute;": 347, "sbquo;": 8218, "sc;": 8827, "scE;": 10932, "scap;": 10936, "scaron;": 353, "sccue;": 8829, "sce;": 10928, "scedil;": 351, "scirc;": 349, "scnE;": 10934, "scnap;": 10938, "scnsim;": 8937, "scpolint;": 10771, "scsim;": 8831, "scy;": 1089, "sdot;": 8901, "sdotb;": 8865, "sdote;": 10854, "seArr;": 8664, "searhk;": 10533, "searr;": 8600, "searrow;": 8600, sect: 167, "sect;": 167, "semi;": 59, "seswar;": 10537, "setminus;": 8726, "setmn;": 8726, "sext;": 10038, "sfr;": [55349, 56624], "sfrown;": 8994, "sharp;": 9839, "shchcy;": 1097, "shcy;": 1096, "shortmid;": 8739, "shortparallel;": 8741, shy: 173, "shy;": 173, "sigma;": 963, "sigmaf;": 962, "sigmav;": 962, "sim;": 8764, "simdot;": 10858, "sime;": 8771, "simeq;": 8771, "simg;": 10910, "simgE;": 10912, "siml;": 10909, "simlE;": 10911, "simne;": 8774, "simplus;": 10788, "simrarr;": 10610, "slarr;": 8592, "smallsetminus;": 8726, "smashp;": 10803, "smeparsl;": 10724, "smid;": 8739, "smile;": 8995, "smt;": 10922, "smte;": 10924, "smtes;": [10924, 65024], "softcy;": 1100, "sol;": 47, "solb;": 10692, "solbar;": 9023, "sopf;": [55349, 56676], "spades;": 9824, "spadesuit;": 9824, "spar;": 8741, "sqcap;": 8851, "sqcaps;": [8851, 65024], "sqcup;": 8852, "sqcups;": [8852, 65024], "sqsub;": 8847, "sqsube;": 8849, "sqsubset;": 8847, "sqsubseteq;": 8849, "sqsup;": 8848, "sqsupe;": 8850, "sqsupset;": 8848, "sqsupseteq;": 8850, "squ;": 9633, "square;": 9633, "squarf;": 9642, "squf;": 9642, "srarr;": 8594, "sscr;": [55349, 56520], "ssetmn;": 8726, "ssmile;": 8995, "sstarf;": 8902, "star;": 9734, "starf;": 9733, "straightepsilon;": 1013, "straightphi;": 981, "strns;": 175, "sub;": 8834, "subE;": 10949, "subdot;": 10941, "sube;": 8838, "subedot;": 10947, "submult;": 10945, "subnE;": 10955, "subne;": 8842, "subplus;": 10943, "subrarr;": 10617, "subset;": 8834, "subseteq;": 8838, "subseteqq;": 10949, "subsetneq;": 8842, "subsetneqq;": 10955, "subsim;": 10951, "subsub;": 10965, "subsup;": 10963, "succ;": 8827, "succapprox;": 10936, "succcurlyeq;": 8829, "succeq;": 10928, "succnapprox;": 10938, "succneqq;": 10934, "succnsim;": 8937, "succsim;": 8831, "sum;": 8721, "sung;": 9834, sup1: 185, "sup1;": 185, sup2: 178, "sup2;": 178, sup3: 179, "sup3;": 179, "sup;": 8835, "supE;": 10950, "supdot;": 10942, "supdsub;": 10968, "supe;": 8839, "supedot;": 10948, "suphsol;": 10185, "suphsub;": 10967, "suplarr;": 10619, "supmult;": 10946, "supnE;": 10956, "supne;": 8843, "supplus;": 10944, "supset;": 8835, "supseteq;": 8839, "supseteqq;": 10950, "supsetneq;": 8843, "supsetneqq;": 10956, "supsim;": 10952, "supsub;": 10964, "supsup;": 10966, "swArr;": 8665, "swarhk;": 10534, "swarr;": 8601, "swarrow;": 8601, "swnwar;": 10538, szlig: 223, "szlig;": 223, "target;": 8982, "tau;": 964, "tbrk;": 9140, "tcaron;": 357, "tcedil;": 355, "tcy;": 1090, "tdot;": 8411, "telrec;": 8981, "tfr;": [55349, 56625], "there4;": 8756, "therefore;": 8756, "theta;": 952, "thetasym;": 977, "thetav;": 977, "thickapprox;": 8776, "thicksim;": 8764, "thinsp;": 8201, "thkap;": 8776, "thksim;": 8764, thorn: 254, "thorn;": 254, "tilde;": 732, times: 215, "times;": 215, "timesb;": 8864, "timesbar;": 10801, "timesd;": 10800, "tint;": 8749, "toea;": 10536, "top;": 8868, "topbot;": 9014, "topcir;": 10993, "topf;": [55349, 56677], "topfork;": 10970, "tosa;": 10537, "tprime;": 8244, "trade;": 8482, "triangle;": 9653, "triangledown;": 9663, "triangleleft;": 9667, "trianglelefteq;": 8884, "triangleq;": 8796, "triangleright;": 9657, "trianglerighteq;": 8885, "tridot;": 9708, "trie;": 8796, "triminus;": 10810, "triplus;": 10809, "trisb;": 10701, "tritime;": 10811, "trpezium;": 9186, "tscr;": [55349, 56521], "tscy;": 1094, "tshcy;": 1115, "tstrok;": 359, "twixt;": 8812, "twoheadleftarrow;": 8606, "twoheadrightarrow;": 8608, "uArr;": 8657, "uHar;": 10595, uacute: 250, "uacute;": 250, "uarr;": 8593, "ubrcy;": 1118, "ubreve;": 365, ucirc: 251, "ucirc;": 251, "ucy;": 1091, "udarr;": 8645, "udblac;": 369, "udhar;": 10606, "ufisht;": 10622, "ufr;": [55349, 56626], ugrave: 249, "ugrave;": 249, "uharl;": 8639, "uharr;": 8638, "uhblk;": 9600, "ulcorn;": 8988, "ulcorner;": 8988, "ulcrop;": 8975, "ultri;": 9720, "umacr;": 363, uml: 168, "uml;": 168, "uogon;": 371, "uopf;": [55349, 56678], "uparrow;": 8593, "updownarrow;": 8597, "upharpoonleft;": 8639, "upharpoonright;": 8638, "uplus;": 8846, "upsi;": 965, "upsih;": 978, "upsilon;": 965, "upuparrows;": 8648, "urcorn;": 8989, "urcorner;": 8989, "urcrop;": 8974, "uring;": 367, "urtri;": 9721, "uscr;": [55349, 56522], "utdot;": 8944, "utilde;": 361, "utri;": 9653, "utrif;": 9652, "uuarr;": 8648, uuml: 252, "uuml;": 252, "uwangle;": 10663, "vArr;": 8661, "vBar;": 10984, "vBarv;": 10985, "vDash;": 8872, "vangrt;": 10652, "varepsilon;": 1013, "varkappa;": 1008, "varnothing;": 8709, "varphi;": 981, "varpi;": 982, "varpropto;": 8733, "varr;": 8597, "varrho;": 1009, "varsigma;": 962, "varsubsetneq;": [8842, 65024], "varsubsetneqq;": [10955, 65024], "varsupsetneq;": [8843, 65024], "varsupsetneqq;": [10956, 65024], "vartheta;": 977, "vartriangleleft;": 8882, "vartriangleright;": 8883, "vcy;": 1074, "vdash;": 8866, "vee;": 8744, "veebar;": 8891, "veeeq;": 8794, "vellip;": 8942, "verbar;": 124, "vert;": 124, "vfr;": [55349, 56627], "vltri;": 8882, "vnsub;": [8834, 8402], "vnsup;": [8835, 8402], "vopf;": [55349, 56679], "vprop;": 8733, "vrtri;": 8883, "vscr;": [55349, 56523], "vsubnE;": [10955, 65024], "vsubne;": [8842, 65024], "vsupnE;": [10956, 65024], "vsupne;": [8843, 65024], "vzigzag;": 10650, "wcirc;": 373, "wedbar;": 10847, "wedge;": 8743, "wedgeq;": 8793, "weierp;": 8472, "wfr;": [55349, 56628], "wopf;": [55349, 56680], "wp;": 8472, "wr;": 8768, "wreath;": 8768, "wscr;": [55349, 56524], "xcap;": 8898, "xcirc;": 9711, "xcup;": 8899, "xdtri;": 9661, "xfr;": [55349, 56629], "xhArr;": 10234, "xharr;": 10231, "xi;": 958, "xlArr;": 10232, "xlarr;": 10229, "xmap;": 10236, "xnis;": 8955, "xodot;": 10752, "xopf;": [55349, 56681], "xoplus;": 10753, "xotime;": 10754, "xrArr;": 10233, "xrarr;": 10230, "xscr;": [55349, 56525], "xsqcup;": 10758, "xuplus;": 10756, "xutri;": 9651, "xvee;": 8897, "xwedge;": 8896, yacute: 253, "yacute;": 253, "yacy;": 1103, "ycirc;": 375, "ycy;": 1099, yen: 165, "yen;": 165, "yfr;": [55349, 56630], "yicy;": 1111, "yopf;": [55349, 56682], "yscr;": [55349, 56526], "yucy;": 1102, yuml: 255, "yuml;": 255, "zacute;": 378, "zcaron;": 382, "zcy;": 1079, "zdot;": 380, "zeetrf;": 8488, "zeta;": 950, "zfr;": [55349, 56631], "zhcy;": 1078, "zigrarr;": 8669, "zopf;": [55349, 56683], "zscr;": [55349, 56527], "zwj;": 8205, "zwnj;": 8204 }, Ko = /(A(?:Elig;?|MP;?|acute;?|breve;|c(?:irc;?|y;)|fr;|grave;?|lpha;|macr;|nd;|o(?:gon;|pf;)|pplyFunction;|ring;?|s(?:cr;|sign;)|tilde;?|uml;?)|B(?:a(?:ckslash;|r(?:v;|wed;))|cy;|e(?:cause;|rnoullis;|ta;)|fr;|opf;|reve;|scr;|umpeq;)|C(?:Hcy;|OPY;?|a(?:cute;|p(?:;|italDifferentialD;)|yleys;)|c(?:aron;|edil;?|irc;|onint;)|dot;|e(?:dilla;|nterDot;)|fr;|hi;|ircle(?:Dot;|Minus;|Plus;|Times;)|lo(?:ckwiseContourIntegral;|seCurly(?:DoubleQuote;|Quote;))|o(?:lon(?:;|e;)|n(?:gruent;|int;|tourIntegral;)|p(?:f;|roduct;)|unterClockwiseContourIntegral;)|ross;|scr;|up(?:;|Cap;))|D(?:D(?:;|otrahd;)|Jcy;|Scy;|Zcy;|a(?:gger;|rr;|shv;)|c(?:aron;|y;)|el(?:;|ta;)|fr;|i(?:a(?:critical(?:Acute;|Do(?:t;|ubleAcute;)|Grave;|Tilde;)|mond;)|fferentialD;)|o(?:pf;|t(?:;|Dot;|Equal;)|uble(?:ContourIntegral;|Do(?:t;|wnArrow;)|L(?:eft(?:Arrow;|RightArrow;|Tee;)|ong(?:Left(?:Arrow;|RightArrow;)|RightArrow;))|Right(?:Arrow;|Tee;)|Up(?:Arrow;|DownArrow;)|VerticalBar;)|wn(?:Arrow(?:;|Bar;|UpArrow;)|Breve;|Left(?:RightVector;|TeeVector;|Vector(?:;|Bar;))|Right(?:TeeVector;|Vector(?:;|Bar;))|Tee(?:;|Arrow;)|arrow;))|s(?:cr;|trok;))|E(?:NG;|TH;?|acute;?|c(?:aron;|irc;?|y;)|dot;|fr;|grave;?|lement;|m(?:acr;|pty(?:SmallSquare;|VerySmallSquare;))|o(?:gon;|pf;)|psilon;|qu(?:al(?:;|Tilde;)|ilibrium;)|s(?:cr;|im;)|ta;|uml;?|x(?:ists;|ponentialE;))|F(?:cy;|fr;|illed(?:SmallSquare;|VerySmallSquare;)|o(?:pf;|rAll;|uriertrf;)|scr;)|G(?:Jcy;|T;?|amma(?:;|d;)|breve;|c(?:edil;|irc;|y;)|dot;|fr;|g;|opf;|reater(?:Equal(?:;|Less;)|FullEqual;|Greater;|Less;|SlantEqual;|Tilde;)|scr;|t;)|H(?:ARDcy;|a(?:cek;|t;)|circ;|fr;|ilbertSpace;|o(?:pf;|rizontalLine;)|s(?:cr;|trok;)|ump(?:DownHump;|Equal;))|I(?:Ecy;|Jlig;|Ocy;|acute;?|c(?:irc;?|y;)|dot;|fr;|grave;?|m(?:;|a(?:cr;|ginaryI;)|plies;)|n(?:t(?:;|e(?:gral;|rsection;))|visible(?:Comma;|Times;))|o(?:gon;|pf;|ta;)|scr;|tilde;|u(?:kcy;|ml;?))|J(?:c(?:irc;|y;)|fr;|opf;|s(?:cr;|ercy;)|ukcy;)|K(?:Hcy;|Jcy;|appa;|c(?:edil;|y;)|fr;|opf;|scr;)|L(?:Jcy;|T;?|a(?:cute;|mbda;|ng;|placetrf;|rr;)|c(?:aron;|edil;|y;)|e(?:ft(?:A(?:ngleBracket;|rrow(?:;|Bar;|RightArrow;))|Ceiling;|Do(?:ubleBracket;|wn(?:TeeVector;|Vector(?:;|Bar;)))|Floor;|Right(?:Arrow;|Vector;)|T(?:ee(?:;|Arrow;|Vector;)|riangle(?:;|Bar;|Equal;))|Up(?:DownVector;|TeeVector;|Vector(?:;|Bar;))|Vector(?:;|Bar;)|arrow;|rightarrow;)|ss(?:EqualGreater;|FullEqual;|Greater;|Less;|SlantEqual;|Tilde;))|fr;|l(?:;|eftarrow;)|midot;|o(?:ng(?:Left(?:Arrow;|RightArrow;)|RightArrow;|left(?:arrow;|rightarrow;)|rightarrow;)|pf;|wer(?:LeftArrow;|RightArrow;))|s(?:cr;|h;|trok;)|t;)|M(?:ap;|cy;|e(?:diumSpace;|llintrf;)|fr;|inusPlus;|opf;|scr;|u;)|N(?:Jcy;|acute;|c(?:aron;|edil;|y;)|e(?:gative(?:MediumSpace;|Thi(?:ckSpace;|nSpace;)|VeryThinSpace;)|sted(?:GreaterGreater;|LessLess;)|wLine;)|fr;|o(?:Break;|nBreakingSpace;|pf;|t(?:;|C(?:ongruent;|upCap;)|DoubleVerticalBar;|E(?:lement;|qual(?:;|Tilde;)|xists;)|Greater(?:;|Equal;|FullEqual;|Greater;|Less;|SlantEqual;|Tilde;)|Hump(?:DownHump;|Equal;)|Le(?:ftTriangle(?:;|Bar;|Equal;)|ss(?:;|Equal;|Greater;|Less;|SlantEqual;|Tilde;))|Nested(?:GreaterGreater;|LessLess;)|Precedes(?:;|Equal;|SlantEqual;)|R(?:everseElement;|ightTriangle(?:;|Bar;|Equal;))|S(?:quareSu(?:bset(?:;|Equal;)|perset(?:;|Equal;))|u(?:bset(?:;|Equal;)|cceeds(?:;|Equal;|SlantEqual;|Tilde;)|perset(?:;|Equal;)))|Tilde(?:;|Equal;|FullEqual;|Tilde;)|VerticalBar;))|scr;|tilde;?|u;)|O(?:Elig;|acute;?|c(?:irc;?|y;)|dblac;|fr;|grave;?|m(?:acr;|ega;|icron;)|opf;|penCurly(?:DoubleQuote;|Quote;)|r;|s(?:cr;|lash;?)|ti(?:lde;?|mes;)|uml;?|ver(?:B(?:ar;|rac(?:e;|ket;))|Parenthesis;))|P(?:artialD;|cy;|fr;|hi;|i;|lusMinus;|o(?:incareplane;|pf;)|r(?:;|ecedes(?:;|Equal;|SlantEqual;|Tilde;)|ime;|o(?:duct;|portion(?:;|al;)))|s(?:cr;|i;))|Q(?:UOT;?|fr;|opf;|scr;)|R(?:Barr;|EG;?|a(?:cute;|ng;|rr(?:;|tl;))|c(?:aron;|edil;|y;)|e(?:;|verse(?:E(?:lement;|quilibrium;)|UpEquilibrium;))|fr;|ho;|ight(?:A(?:ngleBracket;|rrow(?:;|Bar;|LeftArrow;))|Ceiling;|Do(?:ubleBracket;|wn(?:TeeVector;|Vector(?:;|Bar;)))|Floor;|T(?:ee(?:;|Arrow;|Vector;)|riangle(?:;|Bar;|Equal;))|Up(?:DownVector;|TeeVector;|Vector(?:;|Bar;))|Vector(?:;|Bar;)|arrow;)|o(?:pf;|undImplies;)|rightarrow;|s(?:cr;|h;)|uleDelayed;)|S(?:H(?:CHcy;|cy;)|OFTcy;|acute;|c(?:;|aron;|edil;|irc;|y;)|fr;|hort(?:DownArrow;|LeftArrow;|RightArrow;|UpArrow;)|igma;|mallCircle;|opf;|q(?:rt;|uare(?:;|Intersection;|Su(?:bset(?:;|Equal;)|perset(?:;|Equal;))|Union;))|scr;|tar;|u(?:b(?:;|set(?:;|Equal;))|c(?:ceeds(?:;|Equal;|SlantEqual;|Tilde;)|hThat;)|m;|p(?:;|erset(?:;|Equal;)|set;)))|T(?:HORN;?|RADE;|S(?:Hcy;|cy;)|a(?:b;|u;)|c(?:aron;|edil;|y;)|fr;|h(?:e(?:refore;|ta;)|i(?:ckSpace;|nSpace;))|ilde(?:;|Equal;|FullEqual;|Tilde;)|opf;|ripleDot;|s(?:cr;|trok;))|U(?:a(?:cute;?|rr(?:;|ocir;))|br(?:cy;|eve;)|c(?:irc;?|y;)|dblac;|fr;|grave;?|macr;|n(?:der(?:B(?:ar;|rac(?:e;|ket;))|Parenthesis;)|ion(?:;|Plus;))|o(?:gon;|pf;)|p(?:Arrow(?:;|Bar;|DownArrow;)|DownArrow;|Equilibrium;|Tee(?:;|Arrow;)|arrow;|downarrow;|per(?:LeftArrow;|RightArrow;)|si(?:;|lon;))|ring;|scr;|tilde;|uml;?)|V(?:Dash;|bar;|cy;|dash(?:;|l;)|e(?:e;|r(?:bar;|t(?:;|ical(?:Bar;|Line;|Separator;|Tilde;))|yThinSpace;))|fr;|opf;|scr;|vdash;)|W(?:circ;|edge;|fr;|opf;|scr;)|X(?:fr;|i;|opf;|scr;)|Y(?:Acy;|Icy;|Ucy;|acute;?|c(?:irc;|y;)|fr;|opf;|scr;|uml;)|Z(?:Hcy;|acute;|c(?:aron;|y;)|dot;|e(?:roWidthSpace;|ta;)|fr;|opf;|scr;)|a(?:acute;?|breve;|c(?:;|E;|d;|irc;?|ute;?|y;)|elig;?|f(?:;|r;)|grave;?|l(?:e(?:fsym;|ph;)|pha;)|m(?:a(?:cr;|lg;)|p;?)|n(?:d(?:;|and;|d;|slope;|v;)|g(?:;|e;|le;|msd(?:;|a(?:a;|b;|c;|d;|e;|f;|g;|h;))|rt(?:;|vb(?:;|d;))|s(?:ph;|t;)|zarr;))|o(?:gon;|pf;)|p(?:;|E;|acir;|e;|id;|os;|prox(?:;|eq;))|ring;?|s(?:cr;|t;|ymp(?:;|eq;))|tilde;?|uml;?|w(?:conint;|int;))|b(?:Not;|a(?:ck(?:cong;|epsilon;|prime;|sim(?:;|eq;))|r(?:vee;|wed(?:;|ge;)))|brk(?:;|tbrk;)|c(?:ong;|y;)|dquo;|e(?:caus(?:;|e;)|mptyv;|psi;|rnou;|t(?:a;|h;|ween;))|fr;|ig(?:c(?:ap;|irc;|up;)|o(?:dot;|plus;|times;)|s(?:qcup;|tar;)|triangle(?:down;|up;)|uplus;|vee;|wedge;)|karow;|l(?:a(?:ck(?:lozenge;|square;|triangle(?:;|down;|left;|right;))|nk;)|k(?:1(?:2;|4;)|34;)|ock;)|n(?:e(?:;|quiv;)|ot;)|o(?:pf;|t(?:;|tom;)|wtie;|x(?:D(?:L;|R;|l;|r;)|H(?:;|D;|U;|d;|u;)|U(?:L;|R;|l;|r;)|V(?:;|H;|L;|R;|h;|l;|r;)|box;|d(?:L;|R;|l;|r;)|h(?:;|D;|U;|d;|u;)|minus;|plus;|times;|u(?:L;|R;|l;|r;)|v(?:;|H;|L;|R;|h;|l;|r;)))|prime;|r(?:eve;|vbar;?)|s(?:cr;|emi;|im(?:;|e;)|ol(?:;|b;|hsub;))|u(?:ll(?:;|et;)|mp(?:;|E;|e(?:;|q;))))|c(?:a(?:cute;|p(?:;|and;|brcup;|c(?:ap;|up;)|dot;|s;)|r(?:et;|on;))|c(?:a(?:ps;|ron;)|edil;?|irc;|ups(?:;|sm;))|dot;|e(?:dil;?|mptyv;|nt(?:;|erdot;|))|fr;|h(?:cy;|eck(?:;|mark;)|i;)|ir(?:;|E;|c(?:;|eq;|le(?:arrow(?:left;|right;)|d(?:R;|S;|ast;|circ;|dash;)))|e;|fnint;|mid;|scir;)|lubs(?:;|uit;)|o(?:lon(?:;|e(?:;|q;))|m(?:ma(?:;|t;)|p(?:;|fn;|le(?:ment;|xes;)))|n(?:g(?:;|dot;)|int;)|p(?:f;|rod;|y(?:;|sr;|)))|r(?:arr;|oss;)|s(?:cr;|u(?:b(?:;|e;)|p(?:;|e;)))|tdot;|u(?:darr(?:l;|r;)|e(?:pr;|sc;)|larr(?:;|p;)|p(?:;|brcap;|c(?:ap;|up;)|dot;|or;|s;)|r(?:arr(?:;|m;)|ly(?:eq(?:prec;|succ;)|vee;|wedge;)|ren;?|vearrow(?:left;|right;))|vee;|wed;)|w(?:conint;|int;)|ylcty;)|d(?:Arr;|Har;|a(?:gger;|leth;|rr;|sh(?:;|v;))|b(?:karow;|lac;)|c(?:aron;|y;)|d(?:;|a(?:gger;|rr;)|otseq;)|e(?:g;?|lta;|mptyv;)|f(?:isht;|r;)|har(?:l;|r;)|i(?:am(?:;|ond(?:;|suit;)|s;)|e;|gamma;|sin;|v(?:;|ide(?:;|ontimes;|)|onx;))|jcy;|lc(?:orn;|rop;)|o(?:llar;|pf;|t(?:;|eq(?:;|dot;)|minus;|plus;|square;)|ublebarwedge;|wn(?:arrow;|downarrows;|harpoon(?:left;|right;)))|r(?:bkarow;|c(?:orn;|rop;))|s(?:c(?:r;|y;)|ol;|trok;)|t(?:dot;|ri(?:;|f;))|u(?:arr;|har;)|wangle;|z(?:cy;|igrarr;))|e(?:D(?:Dot;|ot;)|a(?:cute;?|ster;)|c(?:aron;|ir(?:;|c;?)|olon;|y;)|dot;|e;|f(?:Dot;|r;)|g(?:;|rave;?|s(?:;|dot;))|l(?:;|inters;|l;|s(?:;|dot;))|m(?:acr;|pty(?:;|set;|v;)|sp(?:1(?:3;|4;)|;))|n(?:g;|sp;)|o(?:gon;|pf;)|p(?:ar(?:;|sl;)|lus;|si(?:;|lon;|v;))|q(?:c(?:irc;|olon;)|s(?:im;|lant(?:gtr;|less;))|u(?:als;|est;|iv(?:;|DD;))|vparsl;)|r(?:Dot;|arr;)|s(?:cr;|dot;|im;)|t(?:a;|h;?)|u(?:ml;?|ro;)|x(?:cl;|ist;|p(?:ectation;|onentiale;)))|f(?:allingdotseq;|cy;|emale;|f(?:ilig;|l(?:ig;|lig;)|r;)|ilig;|jlig;|l(?:at;|lig;|tns;)|nof;|o(?:pf;|r(?:all;|k(?:;|v;)))|partint;|r(?:a(?:c(?:1(?:2;?|3;|4;?|5;|6;|8;)|2(?:3;|5;)|3(?:4;?|5;|8;)|45;|5(?:6;|8;)|78;)|sl;)|own;)|scr;)|g(?:E(?:;|l;)|a(?:cute;|mma(?:;|d;)|p;)|breve;|c(?:irc;|y;)|dot;|e(?:;|l;|q(?:;|q;|slant;)|s(?:;|cc;|dot(?:;|o(?:;|l;))|l(?:;|es;)))|fr;|g(?:;|g;)|imel;|jcy;|l(?:;|E;|a;|j;)|n(?:E;|ap(?:;|prox;)|e(?:;|q(?:;|q;))|sim;)|opf;|rave;|s(?:cr;|im(?:;|e;|l;))|t(?:;|c(?:c;|ir;)|dot;|lPar;|quest;|r(?:a(?:pprox;|rr;)|dot;|eq(?:less;|qless;)|less;|sim;)|)|v(?:ertneqq;|nE;))|h(?:Arr;|a(?:irsp;|lf;|milt;|r(?:dcy;|r(?:;|cir;|w;)))|bar;|circ;|e(?:arts(?:;|uit;)|llip;|rcon;)|fr;|ks(?:earow;|warow;)|o(?:arr;|mtht;|ok(?:leftarrow;|rightarrow;)|pf;|rbar;)|s(?:cr;|lash;|trok;)|y(?:bull;|phen;))|i(?:acute;?|c(?:;|irc;?|y;)|e(?:cy;|xcl;?)|f(?:f;|r;)|grave;?|i(?:;|i(?:int;|nt;)|nfin;|ota;)|jlig;|m(?:a(?:cr;|g(?:e;|line;|part;)|th;)|of;|ped;)|n(?:;|care;|fin(?:;|tie;)|odot;|t(?:;|cal;|e(?:gers;|rcal;)|larhk;|prod;))|o(?:cy;|gon;|pf;|ta;)|prod;|quest;?|s(?:cr;|in(?:;|E;|dot;|s(?:;|v;)|v;))|t(?:;|ilde;)|u(?:kcy;|ml;?))|j(?:c(?:irc;|y;)|fr;|math;|opf;|s(?:cr;|ercy;)|ukcy;)|k(?:appa(?:;|v;)|c(?:edil;|y;)|fr;|green;|hcy;|jcy;|opf;|scr;)|l(?:A(?:arr;|rr;|tail;)|Barr;|E(?:;|g;)|Har;|a(?:cute;|emptyv;|gran;|mbda;|ng(?:;|d;|le;)|p;|quo;?|rr(?:;|b(?:;|fs;)|fs;|hk;|lp;|pl;|sim;|tl;)|t(?:;|ail;|e(?:;|s;)))|b(?:arr;|brk;|r(?:ac(?:e;|k;)|k(?:e;|sl(?:d;|u;))))|c(?:aron;|e(?:dil;|il;)|ub;|y;)|d(?:ca;|quo(?:;|r;)|r(?:dhar;|ushar;)|sh;)|e(?:;|ft(?:arrow(?:;|tail;)|harpoon(?:down;|up;)|leftarrows;|right(?:arrow(?:;|s;)|harpoons;|squigarrow;)|threetimes;)|g;|q(?:;|q;|slant;)|s(?:;|cc;|dot(?:;|o(?:;|r;))|g(?:;|es;)|s(?:approx;|dot;|eq(?:gtr;|qgtr;)|gtr;|sim;)))|f(?:isht;|loor;|r;)|g(?:;|E;)|h(?:ar(?:d;|u(?:;|l;))|blk;)|jcy;|l(?:;|arr;|corner;|hard;|tri;)|m(?:idot;|oust(?:;|ache;))|n(?:E;|ap(?:;|prox;)|e(?:;|q(?:;|q;))|sim;)|o(?:a(?:ng;|rr;)|brk;|ng(?:left(?:arrow;|rightarrow;)|mapsto;|rightarrow;)|oparrow(?:left;|right;)|p(?:ar;|f;|lus;)|times;|w(?:ast;|bar;)|z(?:;|enge;|f;))|par(?:;|lt;)|r(?:arr;|corner;|har(?:;|d;)|m;|tri;)|s(?:aquo;|cr;|h;|im(?:;|e;|g;)|q(?:b;|uo(?:;|r;))|trok;)|t(?:;|c(?:c;|ir;)|dot;|hree;|imes;|larr;|quest;|r(?:Par;|i(?:;|e;|f;))|)|ur(?:dshar;|uhar;)|v(?:ertneqq;|nE;))|m(?:DDot;|a(?:cr;?|l(?:e;|t(?:;|ese;))|p(?:;|sto(?:;|down;|left;|up;))|rker;)|c(?:omma;|y;)|dash;|easuredangle;|fr;|ho;|i(?:cro;?|d(?:;|ast;|cir;|dot;?)|nus(?:;|b;|d(?:;|u;)))|l(?:cp;|dr;)|nplus;|o(?:dels;|pf;)|p;|s(?:cr;|tpos;)|u(?:;|ltimap;|map;))|n(?:G(?:g;|t(?:;|v;))|L(?:eft(?:arrow;|rightarrow;)|l;|t(?:;|v;))|Rightarrow;|V(?:Dash;|dash;)|a(?:bla;|cute;|ng;|p(?:;|E;|id;|os;|prox;)|tur(?:;|al(?:;|s;)))|b(?:sp;?|ump(?:;|e;))|c(?:a(?:p;|ron;)|edil;|ong(?:;|dot;)|up;|y;)|dash;|e(?:;|Arr;|ar(?:hk;|r(?:;|ow;))|dot;|quiv;|s(?:ear;|im;)|xist(?:;|s;))|fr;|g(?:E;|e(?:;|q(?:;|q;|slant;)|s;)|sim;|t(?:;|r;))|h(?:Arr;|arr;|par;)|i(?:;|s(?:;|d;)|v;)|jcy;|l(?:Arr;|E;|arr;|dr;|e(?:;|ft(?:arrow;|rightarrow;)|q(?:;|q;|slant;)|s(?:;|s;))|sim;|t(?:;|ri(?:;|e;)))|mid;|o(?:pf;|t(?:;|in(?:;|E;|dot;|v(?:a;|b;|c;))|ni(?:;|v(?:a;|b;|c;))|))|p(?:ar(?:;|allel;|sl;|t;)|olint;|r(?:;|cue;|e(?:;|c(?:;|eq;))))|r(?:Arr;|arr(?:;|c;|w;)|ightarrow;|tri(?:;|e;))|s(?:c(?:;|cue;|e;|r;)|hort(?:mid;|parallel;)|im(?:;|e(?:;|q;))|mid;|par;|qsu(?:be;|pe;)|u(?:b(?:;|E;|e;|set(?:;|eq(?:;|q;)))|cc(?:;|eq;)|p(?:;|E;|e;|set(?:;|eq(?:;|q;)))))|t(?:gl;|ilde;?|lg;|riangle(?:left(?:;|eq;)|right(?:;|eq;)))|u(?:;|m(?:;|ero;|sp;))|v(?:Dash;|Harr;|ap;|dash;|g(?:e;|t;)|infin;|l(?:Arr;|e;|t(?:;|rie;))|r(?:Arr;|trie;)|sim;)|w(?:Arr;|ar(?:hk;|r(?:;|ow;))|near;))|o(?:S;|a(?:cute;?|st;)|c(?:ir(?:;|c;?)|y;)|d(?:ash;|blac;|iv;|ot;|sold;)|elig;|f(?:cir;|r;)|g(?:on;|rave;?|t;)|h(?:bar;|m;)|int;|l(?:arr;|c(?:ir;|ross;)|ine;|t;)|m(?:acr;|ega;|i(?:cron;|d;|nus;))|opf;|p(?:ar;|erp;|lus;)|r(?:;|arr;|d(?:;|er(?:;|of;)|f;?|m;?)|igof;|or;|slope;|v;)|s(?:cr;|lash;?|ol;)|ti(?:lde;?|mes(?:;|as;))|uml;?|vbar;)|p(?:ar(?:;|a(?:;|llel;|)|s(?:im;|l;)|t;)|cy;|er(?:cnt;|iod;|mil;|p;|tenk;)|fr;|h(?:i(?:;|v;)|mmat;|one;)|i(?:;|tchfork;|v;)|l(?:an(?:ck(?:;|h;)|kv;)|us(?:;|acir;|b;|cir;|d(?:o;|u;)|e;|mn;?|sim;|two;))|m;|o(?:intint;|pf;|und;?)|r(?:;|E;|ap;|cue;|e(?:;|c(?:;|approx;|curlyeq;|eq;|n(?:approx;|eqq;|sim;)|sim;))|ime(?:;|s;)|n(?:E;|ap;|sim;)|o(?:d;|f(?:alar;|line;|surf;)|p(?:;|to;))|sim;|urel;)|s(?:cr;|i;)|uncsp;)|q(?:fr;|int;|opf;|prime;|scr;|u(?:at(?:ernions;|int;)|est(?:;|eq;)|ot;?))|r(?:A(?:arr;|rr;|tail;)|Barr;|Har;|a(?:c(?:e;|ute;)|dic;|emptyv;|ng(?:;|d;|e;|le;)|quo;?|rr(?:;|ap;|b(?:;|fs;)|c;|fs;|hk;|lp;|pl;|sim;|tl;|w;)|t(?:ail;|io(?:;|nals;)))|b(?:arr;|brk;|r(?:ac(?:e;|k;)|k(?:e;|sl(?:d;|u;))))|c(?:aron;|e(?:dil;|il;)|ub;|y;)|d(?:ca;|ldhar;|quo(?:;|r;)|sh;)|e(?:al(?:;|ine;|part;|s;)|ct;|g;?)|f(?:isht;|loor;|r;)|h(?:ar(?:d;|u(?:;|l;))|o(?:;|v;))|i(?:ght(?:arrow(?:;|tail;)|harpoon(?:down;|up;)|left(?:arrows;|harpoons;)|rightarrows;|squigarrow;|threetimes;)|ng;|singdotseq;)|l(?:arr;|har;|m;)|moust(?:;|ache;)|nmid;|o(?:a(?:ng;|rr;)|brk;|p(?:ar;|f;|lus;)|times;)|p(?:ar(?:;|gt;)|polint;)|rarr;|s(?:aquo;|cr;|h;|q(?:b;|uo(?:;|r;)))|t(?:hree;|imes;|ri(?:;|e;|f;|ltri;))|uluhar;|x;)|s(?:acute;|bquo;|c(?:;|E;|a(?:p;|ron;)|cue;|e(?:;|dil;)|irc;|n(?:E;|ap;|sim;)|polint;|sim;|y;)|dot(?:;|b;|e;)|e(?:Arr;|ar(?:hk;|r(?:;|ow;))|ct;?|mi;|swar;|tm(?:inus;|n;)|xt;)|fr(?:;|own;)|h(?:arp;|c(?:hcy;|y;)|ort(?:mid;|parallel;)|y;?)|i(?:gma(?:;|f;|v;)|m(?:;|dot;|e(?:;|q;)|g(?:;|E;)|l(?:;|E;)|ne;|plus;|rarr;))|larr;|m(?:a(?:llsetminus;|shp;)|eparsl;|i(?:d;|le;)|t(?:;|e(?:;|s;)))|o(?:ftcy;|l(?:;|b(?:;|ar;))|pf;)|pa(?:des(?:;|uit;)|r;)|q(?:c(?:ap(?:;|s;)|up(?:;|s;))|su(?:b(?:;|e;|set(?:;|eq;))|p(?:;|e;|set(?:;|eq;)))|u(?:;|ar(?:e;|f;)|f;))|rarr;|s(?:cr;|etmn;|mile;|tarf;)|t(?:ar(?:;|f;)|r(?:aight(?:epsilon;|phi;)|ns;))|u(?:b(?:;|E;|dot;|e(?:;|dot;)|mult;|n(?:E;|e;)|plus;|rarr;|s(?:et(?:;|eq(?:;|q;)|neq(?:;|q;))|im;|u(?:b;|p;)))|cc(?:;|approx;|curlyeq;|eq;|n(?:approx;|eqq;|sim;)|sim;)|m;|ng;|p(?:1;?|2;?|3;?|;|E;|d(?:ot;|sub;)|e(?:;|dot;)|hs(?:ol;|ub;)|larr;|mult;|n(?:E;|e;)|plus;|s(?:et(?:;|eq(?:;|q;)|neq(?:;|q;))|im;|u(?:b;|p;))))|w(?:Arr;|ar(?:hk;|r(?:;|ow;))|nwar;)|zlig;?)|t(?:a(?:rget;|u;)|brk;|c(?:aron;|edil;|y;)|dot;|elrec;|fr;|h(?:e(?:re(?:4;|fore;)|ta(?:;|sym;|v;))|i(?:ck(?:approx;|sim;)|nsp;)|k(?:ap;|sim;)|orn;?)|i(?:lde;|mes(?:;|b(?:;|ar;)|d;|)|nt;)|o(?:ea;|p(?:;|bot;|cir;|f(?:;|ork;))|sa;)|prime;|r(?:ade;|i(?:angle(?:;|down;|left(?:;|eq;)|q;|right(?:;|eq;))|dot;|e;|minus;|plus;|sb;|time;)|pezium;)|s(?:c(?:r;|y;)|hcy;|trok;)|w(?:ixt;|ohead(?:leftarrow;|rightarrow;)))|u(?:Arr;|Har;|a(?:cute;?|rr;)|br(?:cy;|eve;)|c(?:irc;?|y;)|d(?:arr;|blac;|har;)|f(?:isht;|r;)|grave;?|h(?:ar(?:l;|r;)|blk;)|l(?:c(?:orn(?:;|er;)|rop;)|tri;)|m(?:acr;|l;?)|o(?:gon;|pf;)|p(?:arrow;|downarrow;|harpoon(?:left;|right;)|lus;|si(?:;|h;|lon;)|uparrows;)|r(?:c(?:orn(?:;|er;)|rop;)|ing;|tri;)|scr;|t(?:dot;|ilde;|ri(?:;|f;))|u(?:arr;|ml;?)|wangle;)|v(?:Arr;|Bar(?:;|v;)|Dash;|a(?:ngrt;|r(?:epsilon;|kappa;|nothing;|p(?:hi;|i;|ropto;)|r(?:;|ho;)|s(?:igma;|u(?:bsetneq(?:;|q;)|psetneq(?:;|q;)))|t(?:heta;|riangle(?:left;|right;))))|cy;|dash;|e(?:e(?:;|bar;|eq;)|llip;|r(?:bar;|t;))|fr;|ltri;|nsu(?:b;|p;)|opf;|prop;|rtri;|s(?:cr;|u(?:bn(?:E;|e;)|pn(?:E;|e;)))|zigzag;)|w(?:circ;|e(?:d(?:bar;|ge(?:;|q;))|ierp;)|fr;|opf;|p;|r(?:;|eath;)|scr;)|x(?:c(?:ap;|irc;|up;)|dtri;|fr;|h(?:Arr;|arr;)|i;|l(?:Arr;|arr;)|map;|nis;|o(?:dot;|p(?:f;|lus;)|time;)|r(?:Arr;|arr;)|s(?:cr;|qcup;)|u(?:plus;|tri;)|vee;|wedge;)|y(?:ac(?:ute;?|y;)|c(?:irc;|y;)|en;?|fr;|icy;|opf;|scr;|u(?:cy;|ml;?))|z(?:acute;|c(?:aron;|y;)|dot;|e(?:etrf;|ta;)|fr;|hcy;|igrarr;|opf;|scr;|w(?:j;|nj;)))|[\s\S]/g, z0 = 32, j0 = /[^\r"&\u0000]+/g, G0 = /[^\r'&\u0000]+/g, W0 = /[^\r\t\n\f &>\u0000]+/g, Y0 = /[^\r\t\n\f \/>A-Z\u0000]+/g, $0 = /[^\r\t\n\f \/=>A-Z\u0000]+/g, K0 = /[^\]\r\u0000\uffff]*/g, X0 = /[^&<\r\u0000\uffff]*/g, Xo = /[^<\r\u0000\uffff]*/g, Q0 = /[^\r\u0000\uffff]*/g, Qo = /(?:(\/)?([a-z]+)>)|[\s\S]/g, Zo = /(?:([-a-z]+)[ \t\n\f]*=[ \t\n\f]*('[^'&\r\u0000]*'|"[^"&\r\u0000]*"|[^\t\n\r\f "&'\u0000>][^&> \t\n\r\f\u0000]*[ \t\n\f]))|[\s\S]/g, kn = /[^\x09\x0A\x0C\x0D\x20]/, ni = /[^\x09\x0A\x0C\x0D\x20]/g, Z0 = /[^\x00\x09\x0A\x0C\x0D\x20]/, Ht = /^[\x09\x0A\x0C\x0D\x20]+/, Sn = /\x00/g;
  function Ce(e2) {
    var t = 16384;
    if (e2.length < t)
      return String.fromCharCode.apply(String, e2);
    for (var r = "", n = 0; n < e2.length; n += t)
      r += String.fromCharCode.apply(String, e2.slice(n, n + t));
    return r;
  }
  function J0(e2) {
    for (var t = [], r = 0; r < e2.length; r++)
      t[r] = e2.charCodeAt(r);
    return t;
  }
  function te(e2, t) {
    if (typeof t == "string")
      return e2.namespaceURI === q.HTML && e2.localName === t;
    var r = t[e2.namespaceURI];
    return r && r[e2.localName];
  }
  function Jo(e2) {
    return te(e2, uc);
  }
  function ec(e2) {
    if (te(e2, fc))
      return true;
    if (e2.namespaceURI === q.MATHML && e2.localName === "annotation-xml") {
      var t = e2.getAttribute("encoding");
      if (t && (t = t.toLowerCase()), t === "text/html" || t === "application/xhtml+xml")
        return true;
    }
    return false;
  }
  function ef(e2) {
    return e2 in Yo ? Yo[e2] : e2;
  }
  function tc(e2) {
    for (var t = 0, r = e2.length; t < r; t++)
      e2[t][0] in Wo && (e2[t][0] = Wo[e2[t][0]]);
  }
  function rc(e2) {
    for (var t = 0, r = e2.length; t < r; t++)
      if (e2[t][0] === "definitionurl") {
        e2[t][0] = "definitionURL";
        break;
      }
  }
  function ai(e2) {
    for (var t = 0, r = e2.length; t < r; t++)
      e2[t][0] in Go && e2[t].push(Go[e2[t][0]]);
  }
  function nc(e2, t) {
    for (var r = 0, n = e2.length; r < n; r++) {
      var l = e2[r][0], f2 = e2[r][1];
      t.hasAttribute(l) || t._setAttribute(l, f2);
    }
  }
  Y.ElementStack = function() {
    this.elements = [], this.top = null;
  };
  Y.ElementStack.prototype.push = function(e2) {
    this.elements.push(e2), this.top = e2;
  };
  Y.ElementStack.prototype.pop = function(e2) {
    this.elements.pop(), this.top = this.elements[this.elements.length - 1];
  };
  Y.ElementStack.prototype.popTag = function(e2) {
    for (var t = this.elements.length - 1; t > 0; t--) {
      var r = this.elements[t];
      if (te(r, e2))
        break;
    }
    this.elements.length = t, this.top = this.elements[t - 1];
  };
  Y.ElementStack.prototype.popElementType = function(e2) {
    for (var t = this.elements.length - 1; t > 0 && !(this.elements[t] instanceof e2); t--)
      ;
    this.elements.length = t, this.top = this.elements[t - 1];
  };
  Y.ElementStack.prototype.popElement = function(e2) {
    for (var t = this.elements.length - 1; t > 0 && this.elements[t] !== e2; t--)
      ;
    this.elements.length = t, this.top = this.elements[t - 1];
  };
  Y.ElementStack.prototype.removeElement = function(e2) {
    if (this.top === e2)
      this.pop();
    else {
      var t = this.elements.lastIndexOf(e2);
      t !== -1 && this.elements.splice(t, 1);
    }
  };
  Y.ElementStack.prototype.clearToContext = function(e2) {
    for (var t = this.elements.length - 1; t > 0 && !te(this.elements[t], e2); t--)
      ;
    this.elements.length = t + 1, this.top = this.elements[t];
  };
  Y.ElementStack.prototype.contains = function(e2) {
    return this.inSpecificScope(e2, /* @__PURE__ */ Object.create(null));
  };
  Y.ElementStack.prototype.inSpecificScope = function(e2, t) {
    for (var r = this.elements.length - 1; r >= 0; r--) {
      var n = this.elements[r];
      if (te(n, e2))
        return true;
      if (te(n, t))
        return false;
    }
    return false;
  };
  Y.ElementStack.prototype.elementInSpecificScope = function(e2, t) {
    for (var r = this.elements.length - 1; r >= 0; r--) {
      var n = this.elements[r];
      if (n === e2)
        return true;
      if (te(n, t))
        return false;
    }
    return false;
  };
  Y.ElementStack.prototype.elementTypeInSpecificScope = function(e2, t) {
    for (var r = this.elements.length - 1; r >= 0; r--) {
      var n = this.elements[r];
      if (n instanceof e2)
        return true;
      if (te(n, t))
        return false;
    }
    return false;
  };
  Y.ElementStack.prototype.inScope = function(e2) {
    return this.inSpecificScope(e2, nt);
  };
  Y.ElementStack.prototype.elementInScope = function(e2) {
    return this.elementInSpecificScope(e2, nt);
  };
  Y.ElementStack.prototype.elementTypeInScope = function(e2) {
    return this.elementTypeInSpecificScope(e2, nt);
  };
  Y.ElementStack.prototype.inButtonScope = function(e2) {
    return this.inSpecificScope(e2, oi);
  };
  Y.ElementStack.prototype.inListItemScope = function(e2) {
    return this.inSpecificScope(e2, An);
  };
  Y.ElementStack.prototype.inTableScope = function(e2) {
    return this.inSpecificScope(e2, lc);
  };
  Y.ElementStack.prototype.inSelectScope = function(e2) {
    for (var t = this.elements.length - 1; t >= 0; t--) {
      var r = this.elements[t];
      if (r.namespaceURI !== q.HTML)
        return false;
      var n = r.localName;
      if (n === e2)
        return true;
      if (n !== "optgroup" && n !== "option")
        return false;
    }
    return false;
  };
  Y.ElementStack.prototype.generateImpliedEndTags = function(e2, t) {
    for (var r = t ? oc : sc, n = this.elements.length - 1; n >= 0; n--) {
      var l = this.elements[n];
      if (e2 && te(l, e2) || !te(this.elements[n], r))
        break;
    }
    this.elements.length = n + 1, this.top = this.elements[n];
  };
  Y.ActiveFormattingElements = function() {
    this.list = [], this.attrs = [];
  };
  Y.ActiveFormattingElements.prototype.MARKER = { localName: "|" };
  Y.ActiveFormattingElements.prototype.insertMarker = function() {
    this.list.push(this.MARKER), this.attrs.push(this.MARKER);
  };
  Y.ActiveFormattingElements.prototype.push = function(e2, t) {
    for (var r = 0, n = this.list.length - 1; n >= 0 && this.list[n] !== this.MARKER; n--)
      if (_(e2, this.list[n], this.attrs[n]) && (r++, r === 3)) {
        this.list.splice(n, 1), this.attrs.splice(n, 1);
        break;
      }
    this.list.push(e2);
    for (var l = [], f2 = 0; f2 < t.length; f2++)
      l[f2] = t[f2];
    this.attrs.push(l);
    function _(y, w, S) {
      if (y.localName !== w.localName || y._numattrs !== S.length)
        return false;
      for (var D = 0, ae = S.length; D < ae; D++) {
        var ce = S[D][0], g2 = S[D][1];
        if (!y.hasAttribute(ce) || y.getAttribute(ce) !== g2)
          return false;
      }
      return true;
    }
  };
  Y.ActiveFormattingElements.prototype.clearToMarker = function() {
    for (var e2 = this.list.length - 1; e2 >= 0 && this.list[e2] !== this.MARKER; e2--)
      ;
    e2 < 0 && (e2 = 0), this.list.length = e2, this.attrs.length = e2;
  };
  Y.ActiveFormattingElements.prototype.findElementByTag = function(e2) {
    for (var t = this.list.length - 1; t >= 0; t--) {
      var r = this.list[t];
      if (r === this.MARKER)
        break;
      if (r.localName === e2)
        return r;
    }
    return null;
  };
  Y.ActiveFormattingElements.prototype.indexOf = function(e2) {
    return this.list.lastIndexOf(e2);
  };
  Y.ActiveFormattingElements.prototype.remove = function(e2) {
    var t = this.list.lastIndexOf(e2);
    t !== -1 && (this.list.splice(t, 1), this.attrs.splice(t, 1));
  };
  Y.ActiveFormattingElements.prototype.replace = function(e2, t, r) {
    var n = this.list.lastIndexOf(e2);
    n !== -1 && (this.list[n] = t, this.attrs[n] = r);
  };
  Y.ActiveFormattingElements.prototype.insertAfter = function(e2, t) {
    var r = this.list.lastIndexOf(e2);
    r !== -1 && (this.list.splice(r, 0, t), this.attrs.splice(r, 0, t));
  };
  function Y(e2, t, r) {
    var n = null, l = 0, f2 = 0, _ = false, y = false, w = 0, S = [], D = "", ae = true, ce = 0, g2 = j, re, $2, V = "", ve = "", U = [], ie = "", be = "", ne = [], qe = [], He = [], Le = [], De = [], ft = false, k = yl, Fe = null, Ge = [], p = new Y.ElementStack(), d2 = new Y.ActiveFormattingElements(), Xe = t !== void 0, se = null, A = null, c2 = true;
    t && (c2 = t.ownerDocument._scripting_enabled), r && r.scripting_enabled === false && (c2 = false);
    var h2 = true, m = false, a, o, u = [], b2 = false, T = false, I = { document: function() {
      return L;
    }, _asDocumentFragment: function() {
      for (var i = L.createDocumentFragment(), s = L.firstChild; s.hasChildNodes(); )
        i.appendChild(s.firstChild);
      return i;
    }, pause: function() {
      ce++;
    }, resume: function() {
      ce--, this.parse("");
    }, parse: function(i, s, x) {
      var E;
      return ce > 0 ? (D += i, true) : (w === 0 ? (D && (i = D + i, D = ""), s && (i += "\uFFFF", _ = true), n = i, l = i.length, f2 = 0, ae && (ae = false, n.charCodeAt(0) === 65279 && (f2 = 1)), w++, E = dt(x), D = n.substring(f2, l), w--) : (w++, S.push(n, l, f2), n = i, l = i.length, f2 = 0, dt(), E = false, D = n.substring(f2, l), f2 = S.pop(), l = S.pop(), n = S.pop(), D && (n = D + n.substring(f2), l = n.length, f2 = 0, D = ""), w--), E);
    } }, L = new I0(true, e2);
    if (L._parser = I, L._scripting_enabled = c2, t) {
      if (t.ownerDocument._quirks && (L._quirks = true), t.ownerDocument._limitedQuirks && (L._limitedQuirks = true), t.namespaceURI === q.HTML)
        switch (t.localName) {
          case "title":
          case "textarea":
            g2 = pt;
            break;
          case "style":
          case "xmp":
          case "iframe":
          case "noembed":
          case "noframes":
          case "script":
          case "plaintext":
            g2 = Or;
            break;
          case "noscript":
            c2 && (g2 = Or);
        }
      var oe = L.createElement("html");
      L._appendChild(oe), p.push(oe), t instanceof ee.HTMLTemplateElement && Ge.push(Wn), sr();
      for (var We = t; We !== null; We = We.parentElement)
        if (We instanceof ee.HTMLFormElement) {
          A = We;
          break;
        }
    }
    function dt(i) {
      for (var s, x, E, v; f2 < l; ) {
        if (ce > 0 || i && i())
          return true;
        switch (typeof g2.lookahead) {
          case "undefined":
            if (s = n.charCodeAt(f2++), y && (y = false, s === 10)) {
              f2++;
              continue;
            }
            switch (s) {
              case 13:
                f2 < l ? n.charCodeAt(f2) === 10 && f2++ : y = true, g2(10);
                break;
              case 65535:
                if (_ && f2 === l) {
                  g2(wn);
                  break;
                }
              default:
                g2(s);
                break;
            }
            break;
          case "number":
            s = n.charCodeAt(f2);
            var N = g2.lookahead, F = true;
            if (N < 0 && (F = false, N = -N), N < l - f2)
              x = F ? n.substring(f2, f2 + N) : null, v = false;
            else if (_)
              x = F ? n.substring(f2, l) : null, v = true, s === 65535 && f2 === l - 1 && (s = wn);
            else
              return true;
            g2(s, x, v);
            break;
          case "string":
            s = n.charCodeAt(f2), E = g2.lookahead;
            var G = n.indexOf(E, f2);
            if (G !== -1)
              x = n.substring(f2, G + E.length), v = false;
            else {
              if (!_)
                return true;
              x = n.substring(f2, l), s === 65535 && f2 === l - 1 && (s = wn), v = true;
            }
            g2(s, x, v);
            break;
        }
      }
      return false;
    }
    function Pe(i, s) {
      for (var x = 0; x < De.length; x++)
        if (De[x][0] === i)
          return;
      s !== void 0 ? De.push([i, s]) : De.push([i]);
    }
    function kt() {
      Zo.lastIndex = f2 - 1;
      var i = Zo.exec(n);
      if (!i)
        throw new Error("should never happen");
      var s = i[1];
      if (!s)
        return false;
      var x = i[2], E = x.length;
      switch (x[0]) {
        case '"':
        case "'":
          x = x.substring(1, E - 1), f2 += i[0].length - 1, g2 = Bn;
          break;
        default:
          g2 = et, f2 += i[0].length - 1, x = x.substring(0, E - 1);
          break;
      }
      for (var v = 0; v < De.length; v++)
        if (De[v][0] === s)
          return true;
      return De.push([s, x]), true;
    }
    function Nc() {
      ft = false, V = "", De.length = 0;
    }
    function rr() {
      ft = true, V = "", De.length = 0;
    }
    function at() {
      U.length = 0;
    }
    function Rn() {
      ie = "";
    }
    function In() {
      be = "";
    }
    function di() {
      ne.length = 0;
    }
    function Pt() {
      qe.length = 0, He = null, Le = null;
    }
    function Dr() {
      He = [];
    }
    function ht() {
      Le = [];
    }
    function X() {
      m = true;
    }
    function Cc() {
      return p.top && p.top.namespaceURI !== "http://www.w3.org/1999/xhtml";
    }
    function Be(i) {
      return ve === i;
    }
    function Bt() {
      if (u.length > 0) {
        var i = Ce(u);
        if (u.length = 0, T && (T = false, i[0] === `
` && (i = i.substring(1)), i.length === 0))
          return;
        pe(er, i), b2 = false;
      }
      T = false;
    }
    function nr(i) {
      i.lastIndex = f2 - 1;
      var s = i.exec(n);
      if (s && s.index === f2 - 1)
        return s = s[0], f2 += s.length - 1, _ && f2 === l && (s = s.slice(0, -1), f2--), s;
      throw new Error("should never happen");
    }
    function ar(i) {
      i.lastIndex = f2 - 1;
      var s = i.exec(n)[0];
      return s ? (Ac(s), f2 += s.length - 1, true) : false;
    }
    function Ac(i) {
      u.length > 0 && Bt(), !(T && (T = false, i[0] === `
` && (i = i.substring(1)), i.length === 0)) && pe(er, i);
    }
    function it() {
      if (ft)
        pe(W, V);
      else {
        var i = V;
        V = "", ve = i, pe(Ne, i, De);
      }
    }
    function Lc() {
      if (f2 === l)
        return false;
      Qo.lastIndex = f2;
      var i = Qo.exec(n);
      if (!i)
        throw new Error("should never happen");
      var s = i[2];
      if (!s)
        return false;
      var x = i[1];
      return x ? (f2 += s.length + 2, pe(W, s)) : (f2 += s.length + 1, ve = s, pe(Ne, s, H0)), true;
    }
    function Dc() {
      ft ? pe(W, V, null, true) : pe(Ne, V, De, true);
    }
    function Q() {
      pe(q0, Ce(qe), He ? Ce(He) : void 0, Le ? Ce(Le) : void 0);
    }
    function z() {
      Bt(), k(wn), L.modclock = 1;
    }
    var pe = I.insertToken = function(s, x, E, v) {
      Bt();
      var N = p.top;
      !N || N.namespaceURI === q.HTML ? k(s, x, E, v) : s !== Ne && s !== er ? Ci(s, x, E, v) : Jo(N) && (s === er || s === Ne && x !== "mglyph" && x !== "malignmark") || s === Ne && x === "svg" && N.namespaceURI === q.MATHML && N.localName === "annotation-xml" || ec(N) ? (o = true, k(s, x, E, v), o = false) : Ci(s, x, E, v);
    };
    function Qe(i) {
      var s = p.top;
      xt && te(s, tr) ? Rr(function(x) {
        return x.createComment(i);
      }) : (s instanceof ee.HTMLTemplateElement && (s = s.content), s._appendChild(s.ownerDocument.createComment(i)));
    }
    function Ze(i) {
      var s = p.top;
      if (xt && te(s, tr))
        Rr(function(E) {
          return E.createTextNode(i);
        });
      else {
        s instanceof ee.HTMLTemplateElement && (s = s.content);
        var x = s.lastChild;
        x && x.nodeType === ri.TEXT_NODE ? x.appendData(i) : s._appendChild(s.ownerDocument.createTextNode(i));
      }
    }
    function ir(i, s, x) {
      var E = ac.createElement(i, s, null);
      if (x)
        for (var v = 0, N = x.length; v < N; v++)
          E._setAttribute(x[v][0], x[v][1]);
      return E;
    }
    var xt = false;
    function B(i, s) {
      var x = Mr(function(E) {
        return ir(E, i, s);
      });
      return te(x, cc) && (x._form = A), x;
    }
    function Mr(i) {
      var s;
      return xt && te(p.top, tr) ? s = Rr(i) : p.top instanceof ee.HTMLTemplateElement ? (s = i(p.top.content.ownerDocument), p.top.content._appendChild(s)) : (s = i(p.top.ownerDocument), p.top._appendChild(s)), p.push(s), s;
    }
    function On(i, s, x) {
      return Mr(function(E) {
        var v = E._createElementNS(i, x, null);
        if (s)
          for (var N = 0, F = s.length; N < F; N++) {
            var G = s[N];
            G.length === 2 ? v._setAttribute(G[0], G[1]) : v._setAttributeNS(G[2], G[0], G[1]);
          }
        return v;
      });
    }
    function hi(i) {
      for (var s = p.elements.length - 1; s >= 0; s--)
        if (p.elements[s] instanceof i)
          return s;
      return -1;
    }
    function Rr(i) {
      var s, x, E = -1, v = -1, N;
      if (E = hi(ee.HTMLTableElement), v = hi(ee.HTMLTemplateElement), v >= 0 && (E < 0 || v > E) ? s = p.elements[v] : E >= 0 && (s = p.elements[E].parentNode, s ? x = p.elements[E] : s = p.elements[E - 1]), s || (s = p.elements[0]), s instanceof ee.HTMLTemplateElement && (s = s.content), N = i(s.ownerDocument), N.nodeType === ri.TEXT_NODE) {
        var F;
        if (x ? F = x.previousSibling : F = s.lastChild, F && F.nodeType === ri.TEXT_NODE)
          return F.appendData(N.data), N;
      }
      return x ? s.insertBefore(N, x) : s._appendChild(N), N;
    }
    function sr() {
      for (var i = false, s = p.elements.length - 1; s >= 0; s--) {
        var x = p.elements[s];
        if (s === 0 && (i = true, Xe && (x = t)), x.namespaceURI === q.HTML) {
          var E = x.localName;
          switch (E) {
            case "select":
              for (var v = s; v > 0; ) {
                var N = p.elements[--v];
                if (N instanceof ee.HTMLTemplateElement)
                  break;
                if (N instanceof ee.HTMLTableElement) {
                  k = Yr;
                  return;
                }
              }
              k = st;
              return;
            case "tr":
              k = ur;
              return;
            case "tbody":
            case "tfoot":
            case "thead":
              k = At;
              return;
            case "caption":
              k = Gn;
              return;
            case "colgroup":
              k = Wr;
              return;
            case "table":
              k = Ue;
              return;
            case "template":
              k = Ge[Ge.length - 1];
              return;
            case "body":
              k = H;
              return;
            case "frameset":
              k = Yn;
              return;
            case "html":
              se === null ? k = jr : k = jn;
              return;
            default:
              if (!i) {
                if (E === "head") {
                  k = fe;
                  return;
                }
                if (E === "td" || E === "th") {
                  k = Ut;
                  return;
                }
              }
          }
        }
        if (i) {
          k = H;
          return;
        }
      }
    }
    function or(i, s) {
      B(i, s), g2 = cr, Fe = k, k = Gr;
    }
    function Mc(i, s) {
      B(i, s), g2 = pt, Fe = k, k = Gr;
    }
    function qn(i, s) {
      return { elt: ir(i, d2.list[s].localName, d2.attrs[s]), attrs: d2.attrs[s] };
    }
    function Ae() {
      if (d2.list.length !== 0) {
        var i = d2.list[d2.list.length - 1];
        if (i !== d2.MARKER && p.elements.lastIndexOf(i) === -1) {
          for (var s = d2.list.length - 2; s >= 0 && (i = d2.list[s], !(i === d2.MARKER || p.elements.lastIndexOf(i) !== -1)); s--)
            ;
          for (s = s + 1; s < d2.list.length; s++) {
            var x = Mr(function(E) {
              return qn(E, s).elt;
            });
            d2.list[s] = x;
          }
        }
      }
    }
    var Ir = { localName: "BM" };
    function Rc(i) {
      if (te(p.top, i) && d2.indexOf(p.top) === -1)
        return p.pop(), true;
      for (var s = 0; s < 8; ) {
        s++;
        var x = d2.findElementByTag(i);
        if (!x)
          return false;
        var E = p.elements.lastIndexOf(x);
        if (E === -1)
          return d2.remove(x), true;
        if (!p.elementInScope(x))
          return true;
        for (var v = null, N, F = E + 1; F < p.elements.length; F++)
          if (te(p.elements[F], Ft)) {
            v = p.elements[F], N = F;
            break;
          }
        if (v) {
          var G = p.elements[E - 1];
          d2.insertAfter(x, Ir);
          for (var le = v, ye = v, Ve = N, Ye, Lt = 0; Lt++, le = p.elements[--Ve], le !== x; ) {
            if (Ye = d2.indexOf(le), Lt > 3 && Ye !== -1 && (d2.remove(le), Ye = -1), Ye === -1) {
              p.removeElement(le);
              continue;
            }
            var Et = qn(G.ownerDocument, Ye);
            d2.replace(le, Et.elt, Et.attrs), p.elements[Ve] = Et.elt, le = Et.elt, ye === v && (d2.remove(Ir), d2.insertAfter(Et.elt, Ir)), le._appendChild(ye), ye = le;
          }
          xt && te(G, tr) ? Rr(function() {
            return ye;
          }) : G instanceof ee.HTMLTemplateElement ? G.content._appendChild(ye) : G._appendChild(ye);
          for (var fr = qn(v.ownerDocument, d2.indexOf(x)); v.hasChildNodes(); )
            fr.elt._appendChild(v.firstChild);
          v._appendChild(fr.elt), d2.remove(x), d2.replace(Ir, fr.elt, fr.attrs), p.removeElement(x);
          var Nl = p.elements.lastIndexOf(v);
          p.elements.splice(Nl + 1, 0, fr.elt);
        } else
          return p.popElement(x), d2.remove(x), true;
      }
      return true;
    }
    function Ic() {
      p.pop(), k = Fe;
    }
    function St() {
      delete L._parser, p.elements.length = 0, L.defaultView && L.defaultView.dispatchEvent(new ee.Event("load", {}));
    }
    function R(i, s) {
      g2 = s, f2--;
    }
    function j(i) {
      switch (i) {
        case 38:
          re = j, g2 = lr;
          break;
        case 60:
          if (Lc())
            break;
          g2 = Oc;
          break;
        case 0:
          u.push(i), b2 = true;
          break;
        case -1:
          z();
          break;
        default:
          ar(X0) || u.push(i);
          break;
      }
    }
    function pt(i) {
      switch (i) {
        case 38:
          re = pt, g2 = lr;
          break;
        case 60:
          g2 = Hc;
          break;
        case 0:
          u.push(65533), b2 = true;
          break;
        case -1:
          z();
          break;
        default:
          u.push(i);
          break;
      }
    }
    function cr(i) {
      switch (i) {
        case 60:
          g2 = Bc;
          break;
        case 0:
          u.push(65533);
          break;
        case -1:
          z();
          break;
        default:
          ar(Xo) || u.push(i);
          break;
      }
    }
    function mt(i) {
      switch (i) {
        case 60:
          g2 = zc;
          break;
        case 0:
          u.push(65533);
          break;
        case -1:
          z();
          break;
        default:
          ar(Xo) || u.push(i);
          break;
      }
    }
    function Or(i) {
      switch (i) {
        case 0:
          u.push(65533);
          break;
        case -1:
          z();
          break;
        default:
          ar(Q0) || u.push(i);
          break;
      }
    }
    function Oc(i) {
      switch (i) {
        case 33:
          g2 = gi;
          break;
        case 47:
          g2 = qc;
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          Nc(), R(i, xi);
          break;
        case 63:
          R(i, Pr);
          break;
        default:
          u.push(60), R(i, j);
          break;
      }
    }
    function qc(i) {
      switch (i) {
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          rr(), R(i, xi);
          break;
        case 62:
          g2 = j;
          break;
        case -1:
          u.push(60), u.push(47), z();
          break;
        default:
          R(i, Pr);
          break;
      }
    }
    function xi(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          g2 = et;
          break;
        case 47:
          g2 = bt;
          break;
        case 62:
          g2 = j, it();
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          V += String.fromCharCode(i + 32);
          break;
        case 0:
          V += String.fromCharCode(65533);
          break;
        case -1:
          z();
          break;
        default:
          V += nr(Y0);
          break;
      }
    }
    function Hc(i) {
      i === 47 ? (at(), g2 = Fc) : (u.push(60), R(i, pt));
    }
    function Fc(i) {
      switch (i) {
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          rr(), R(i, Pc);
          break;
        default:
          u.push(60), u.push(47), R(i, pt);
          break;
      }
    }
    function Pc(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          if (Be(V)) {
            g2 = et;
            return;
          }
          break;
        case 47:
          if (Be(V)) {
            g2 = bt;
            return;
          }
          break;
        case 62:
          if (Be(V)) {
            g2 = j, it();
            return;
          }
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          V += String.fromCharCode(i + 32), U.push(i);
          return;
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          V += String.fromCharCode(i), U.push(i);
          return;
      }
      u.push(60), u.push(47), qt(u, U), R(i, pt);
    }
    function Bc(i) {
      i === 47 ? (at(), g2 = Uc) : (u.push(60), R(i, cr));
    }
    function Uc(i) {
      switch (i) {
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          rr(), R(i, Vc);
          break;
        default:
          u.push(60), u.push(47), R(i, cr);
          break;
      }
    }
    function Vc(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          if (Be(V)) {
            g2 = et;
            return;
          }
          break;
        case 47:
          if (Be(V)) {
            g2 = bt;
            return;
          }
          break;
        case 62:
          if (Be(V)) {
            g2 = j, it();
            return;
          }
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          V += String.fromCharCode(i + 32), U.push(i);
          return;
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          V += String.fromCharCode(i), U.push(i);
          return;
      }
      u.push(60), u.push(47), qt(u, U), R(i, cr);
    }
    function zc(i) {
      switch (i) {
        case 47:
          at(), g2 = jc;
          break;
        case 33:
          g2 = Wc, u.push(60), u.push(33);
          break;
        default:
          u.push(60), R(i, mt);
          break;
      }
    }
    function jc(i) {
      switch (i) {
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          rr(), R(i, Gc);
          break;
        default:
          u.push(60), u.push(47), R(i, mt);
          break;
      }
    }
    function Gc(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          if (Be(V)) {
            g2 = et;
            return;
          }
          break;
        case 47:
          if (Be(V)) {
            g2 = bt;
            return;
          }
          break;
        case 62:
          if (Be(V)) {
            g2 = j, it();
            return;
          }
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          V += String.fromCharCode(i + 32), U.push(i);
          return;
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          V += String.fromCharCode(i), U.push(i);
          return;
      }
      u.push(60), u.push(47), qt(u, U), R(i, mt);
    }
    function Wc(i) {
      i === 45 ? (g2 = Yc, u.push(45)) : R(i, mt);
    }
    function Yc(i) {
      i === 45 ? (g2 = pi, u.push(45)) : R(i, mt);
    }
    function Je(i) {
      switch (i) {
        case 45:
          g2 = $c, u.push(45);
          break;
        case 60:
          g2 = Hn;
          break;
        case 0:
          u.push(65533);
          break;
        case -1:
          z();
          break;
        default:
          u.push(i);
          break;
      }
    }
    function $c(i) {
      switch (i) {
        case 45:
          g2 = pi, u.push(45);
          break;
        case 60:
          g2 = Hn;
          break;
        case 0:
          g2 = Je, u.push(65533);
          break;
        case -1:
          z();
          break;
        default:
          g2 = Je, u.push(i);
          break;
      }
    }
    function pi(i) {
      switch (i) {
        case 45:
          u.push(45);
          break;
        case 60:
          g2 = Hn;
          break;
        case 62:
          g2 = mt, u.push(62);
          break;
        case 0:
          g2 = Je, u.push(65533);
          break;
        case -1:
          z();
          break;
        default:
          g2 = Je, u.push(i);
          break;
      }
    }
    function Hn(i) {
      switch (i) {
        case 47:
          at(), g2 = Kc;
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          at(), u.push(60), R(i, Qc);
          break;
        default:
          u.push(60), R(i, Je);
          break;
      }
    }
    function Kc(i) {
      switch (i) {
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          rr(), R(i, Xc);
          break;
        default:
          u.push(60), u.push(47), R(i, Je);
          break;
      }
    }
    function Xc(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          if (Be(V)) {
            g2 = et;
            return;
          }
          break;
        case 47:
          if (Be(V)) {
            g2 = bt;
            return;
          }
          break;
        case 62:
          if (Be(V)) {
            g2 = j, it();
            return;
          }
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          V += String.fromCharCode(i + 32), U.push(i);
          return;
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          V += String.fromCharCode(i), U.push(i);
          return;
      }
      u.push(60), u.push(47), qt(u, U), R(i, Je);
    }
    function Qc(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
        case 47:
        case 62:
          Ce(U) === "script" ? g2 = gt : g2 = Je, u.push(i);
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          U.push(i + 32), u.push(i);
          break;
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          U.push(i), u.push(i);
          break;
        default:
          R(i, Je);
          break;
      }
    }
    function gt(i) {
      switch (i) {
        case 45:
          g2 = Zc, u.push(45);
          break;
        case 60:
          g2 = Fn, u.push(60);
          break;
        case 0:
          u.push(65533);
          break;
        case -1:
          z();
          break;
        default:
          u.push(i);
          break;
      }
    }
    function Zc(i) {
      switch (i) {
        case 45:
          g2 = Jc, u.push(45);
          break;
        case 60:
          g2 = Fn, u.push(60);
          break;
        case 0:
          g2 = gt, u.push(65533);
          break;
        case -1:
          z();
          break;
        default:
          g2 = gt, u.push(i);
          break;
      }
    }
    function Jc(i) {
      switch (i) {
        case 45:
          u.push(45);
          break;
        case 60:
          g2 = Fn, u.push(60);
          break;
        case 62:
          g2 = mt, u.push(62);
          break;
        case 0:
          g2 = gt, u.push(65533);
          break;
        case -1:
          z();
          break;
        default:
          g2 = gt, u.push(i);
          break;
      }
    }
    function Fn(i) {
      i === 47 ? (at(), g2 = el, u.push(47)) : R(i, gt);
    }
    function el(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
        case 47:
        case 62:
          Ce(U) === "script" ? g2 = Je : g2 = gt, u.push(i);
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          U.push(i + 32), u.push(i);
          break;
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
        case 103:
        case 104:
        case 105:
        case 106:
        case 107:
        case 108:
        case 109:
        case 110:
        case 111:
        case 112:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 119:
        case 120:
        case 121:
        case 122:
          U.push(i), u.push(i);
          break;
        default:
          R(i, gt);
          break;
      }
    }
    function et(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          break;
        case 47:
          g2 = bt;
          break;
        case 62:
          g2 = j, it();
          break;
        case -1:
          z();
          break;
        case 61:
          Rn(), ie += String.fromCharCode(i), g2 = Pn;
          break;
        default:
          if (kt())
            break;
          Rn(), R(i, Pn);
          break;
      }
    }
    function Pn(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
        case 47:
        case 62:
        case -1:
          R(i, tl);
          break;
        case 61:
          g2 = mi;
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          ie += String.fromCharCode(i + 32);
          break;
        case 0:
          ie += String.fromCharCode(65533);
          break;
        case 34:
        case 39:
        case 60:
        default:
          ie += nr($0);
          break;
      }
    }
    function tl(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          break;
        case 47:
          Pe(ie), g2 = bt;
          break;
        case 61:
          g2 = mi;
          break;
        case 62:
          g2 = j, Pe(ie), it();
          break;
        case -1:
          Pe(ie), z();
          break;
        default:
          Pe(ie), Rn(), R(i, Pn);
          break;
      }
    }
    function mi(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          break;
        case 34:
          In(), g2 = qr;
          break;
        case 39:
          In(), g2 = Hr;
          break;
        case 62:
        default:
          In(), R(i, Fr);
          break;
      }
    }
    function qr(i) {
      switch (i) {
        case 34:
          Pe(ie, be), g2 = Bn;
          break;
        case 38:
          re = qr, g2 = lr;
          break;
        case 0:
          be += String.fromCharCode(65533);
          break;
        case -1:
          z();
          break;
        case 10:
          be += String.fromCharCode(i);
          break;
        default:
          be += nr(j0);
          break;
      }
    }
    function Hr(i) {
      switch (i) {
        case 39:
          Pe(ie, be), g2 = Bn;
          break;
        case 38:
          re = Hr, g2 = lr;
          break;
        case 0:
          be += String.fromCharCode(65533);
          break;
        case -1:
          z();
          break;
        case 10:
          be += String.fromCharCode(i);
          break;
        default:
          be += nr(G0);
          break;
      }
    }
    function Fr(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          Pe(ie, be), g2 = et;
          break;
        case 38:
          re = Fr, g2 = lr;
          break;
        case 62:
          Pe(ie, be), g2 = j, it();
          break;
        case 0:
          be += String.fromCharCode(65533);
          break;
        case -1:
          f2--, g2 = j;
          break;
        case 34:
        case 39:
        case 60:
        case 61:
        case 96:
        default:
          be += nr(W0);
          break;
      }
    }
    function Bn(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          g2 = et;
          break;
        case 47:
          g2 = bt;
          break;
        case 62:
          g2 = j, it();
          break;
        case -1:
          z();
          break;
        default:
          R(i, et);
          break;
      }
    }
    function bt(i) {
      switch (i) {
        case 62:
          g2 = j, Dc();
          break;
        case -1:
          z();
          break;
        default:
          R(i, et);
          break;
      }
    }
    function Pr(i, s, x) {
      var E = s.length;
      x ? f2 += E - 1 : f2 += E;
      var v = s.substring(0, E - 1);
      v = v.replace(/\u0000/g, "\uFFFD"), v = v.replace(/\u000D\u000A/g, `
`), v = v.replace(/\u000D/g, `
`), pe(rt, v), g2 = j;
    }
    Pr.lookahead = ">";
    function gi(i, s, x) {
      if (s[0] === "-" && s[1] === "-") {
        f2 += 2, di(), g2 = rl;
        return;
      }
      s.toUpperCase() === "DOCTYPE" ? (f2 += 7, g2 = ll) : s === "[CDATA[" && Cc() ? (f2 += 7, g2 = zn) : g2 = Pr;
    }
    gi.lookahead = 7;
    function rl(i) {
      switch (di(), i) {
        case 45:
          g2 = nl;
          break;
        case 62:
          g2 = j, pe(rt, Ce(ne));
          break;
        default:
          R(i, Nt);
          break;
      }
    }
    function nl(i) {
      switch (i) {
        case 45:
          g2 = Br;
          break;
        case 62:
          g2 = j, pe(rt, Ce(ne));
          break;
        case -1:
          pe(rt, Ce(ne)), z();
          break;
        default:
          ne.push(45), R(i, Nt);
          break;
      }
    }
    function Nt(i) {
      switch (i) {
        case 60:
          ne.push(i), g2 = al;
          break;
        case 45:
          g2 = Un;
          break;
        case 0:
          ne.push(65533);
          break;
        case -1:
          pe(rt, Ce(ne)), z();
          break;
        default:
          ne.push(i);
          break;
      }
    }
    function al(i) {
      switch (i) {
        case 33:
          ne.push(i), g2 = il;
          break;
        case 60:
          ne.push(i);
          break;
        default:
          R(i, Nt);
          break;
      }
    }
    function il(i) {
      switch (i) {
        case 45:
          g2 = sl;
          break;
        default:
          R(i, Nt);
          break;
      }
    }
    function sl(i) {
      switch (i) {
        case 45:
          g2 = ol;
          break;
        default:
          R(i, Un);
          break;
      }
    }
    function ol(i) {
      switch (i) {
        case 62:
        case -1:
          R(i, Br);
          break;
        default:
          R(i, Br);
          break;
      }
    }
    function Un(i) {
      switch (i) {
        case 45:
          g2 = Br;
          break;
        case -1:
          pe(rt, Ce(ne)), z();
          break;
        default:
          ne.push(45), R(i, Nt);
          break;
      }
    }
    function Br(i) {
      switch (i) {
        case 62:
          g2 = j, pe(rt, Ce(ne));
          break;
        case 33:
          g2 = cl;
          break;
        case 45:
          ne.push(45);
          break;
        case -1:
          pe(rt, Ce(ne)), z();
          break;
        default:
          ne.push(45), ne.push(45), R(i, Nt);
          break;
      }
    }
    function cl(i) {
      switch (i) {
        case 45:
          ne.push(45), ne.push(45), ne.push(33), g2 = Un;
          break;
        case 62:
          g2 = j, pe(rt, Ce(ne));
          break;
        case -1:
          pe(rt, Ce(ne)), z();
          break;
        default:
          ne.push(45), ne.push(45), ne.push(33), R(i, Nt);
          break;
      }
    }
    function ll(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          g2 = bi;
          break;
        case -1:
          Pt(), X(), Q(), z();
          break;
        default:
          R(i, bi);
          break;
      }
    }
    function bi(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          Pt(), qe.push(i + 32), g2 = Vn;
          break;
        case 0:
          Pt(), qe.push(65533), g2 = Vn;
          break;
        case 62:
          Pt(), X(), g2 = j, Q();
          break;
        case -1:
          Pt(), X(), Q(), z();
          break;
        default:
          Pt(), qe.push(i), g2 = Vn;
          break;
      }
    }
    function Vn(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          g2 = _i;
          break;
        case 62:
          g2 = j, Q();
          break;
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 71:
        case 72:
        case 73:
        case 74:
        case 75:
        case 76:
        case 77:
        case 78:
        case 79:
        case 80:
        case 81:
        case 82:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
          qe.push(i + 32);
          break;
        case 0:
          qe.push(65533);
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          qe.push(i);
          break;
      }
    }
    function _i(i, s, x) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          f2 += 1;
          break;
        case 62:
          g2 = j, f2 += 1, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          s = s.toUpperCase(), s === "PUBLIC" ? (f2 += 6, g2 = ul) : s === "SYSTEM" ? (f2 += 6, g2 = hl) : (X(), g2 = _t);
          break;
      }
    }
    _i.lookahead = 6;
    function ul(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          g2 = fl;
          break;
        case 34:
          Dr(), g2 = Ei;
          break;
        case 39:
          Dr(), g2 = vi;
          break;
        case 62:
          X(), g2 = j, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          X(), g2 = _t;
          break;
      }
    }
    function fl(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          break;
        case 34:
          Dr(), g2 = Ei;
          break;
        case 39:
          Dr(), g2 = vi;
          break;
        case 62:
          X(), g2 = j, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          X(), g2 = _t;
          break;
      }
    }
    function Ei(i) {
      switch (i) {
        case 34:
          g2 = yi;
          break;
        case 0:
          He.push(65533);
          break;
        case 62:
          X(), g2 = j, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          He.push(i);
          break;
      }
    }
    function vi(i) {
      switch (i) {
        case 39:
          g2 = yi;
          break;
        case 0:
          He.push(65533);
          break;
        case 62:
          X(), g2 = j, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          He.push(i);
          break;
      }
    }
    function yi(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          g2 = dl;
          break;
        case 62:
          g2 = j, Q();
          break;
        case 34:
          ht(), g2 = Ur;
          break;
        case 39:
          ht(), g2 = Vr;
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          X(), g2 = _t;
          break;
      }
    }
    function dl(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          break;
        case 62:
          g2 = j, Q();
          break;
        case 34:
          ht(), g2 = Ur;
          break;
        case 39:
          ht(), g2 = Vr;
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          X(), g2 = _t;
          break;
      }
    }
    function hl(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          g2 = xl;
          break;
        case 34:
          ht(), g2 = Ur;
          break;
        case 39:
          ht(), g2 = Vr;
          break;
        case 62:
          X(), g2 = j, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          X(), g2 = _t;
          break;
      }
    }
    function xl(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          break;
        case 34:
          ht(), g2 = Ur;
          break;
        case 39:
          ht(), g2 = Vr;
          break;
        case 62:
          X(), g2 = j, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          X(), g2 = _t;
          break;
      }
    }
    function Ur(i) {
      switch (i) {
        case 34:
          g2 = Ti;
          break;
        case 0:
          Le.push(65533);
          break;
        case 62:
          X(), g2 = j, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          Le.push(i);
          break;
      }
    }
    function Vr(i) {
      switch (i) {
        case 39:
          g2 = Ti;
          break;
        case 0:
          Le.push(65533);
          break;
        case 62:
          X(), g2 = j, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          Le.push(i);
          break;
      }
    }
    function Ti(i) {
      switch (i) {
        case 9:
        case 10:
        case 12:
        case 32:
          break;
        case 62:
          g2 = j, Q();
          break;
        case -1:
          X(), Q(), z();
          break;
        default:
          g2 = _t;
          break;
      }
    }
    function _t(i) {
      switch (i) {
        case 62:
          g2 = j, Q();
          break;
        case -1:
          Q(), z();
          break;
      }
    }
    function zn(i) {
      switch (i) {
        case 93:
          g2 = pl;
          break;
        case -1:
          z();
          break;
        case 0:
          b2 = true;
        default:
          ar(K0) || u.push(i);
          break;
      }
    }
    function pl(i) {
      switch (i) {
        case 93:
          g2 = ml;
          break;
        default:
          u.push(93), R(i, zn);
          break;
      }
    }
    function ml(i) {
      switch (i) {
        case 93:
          u.push(93);
          break;
        case 62:
          Bt(), g2 = j;
          break;
        default:
          u.push(93), u.push(93), R(i, zn);
          break;
      }
    }
    function lr(i) {
      switch (at(), U.push(38), i) {
        case 9:
        case 10:
        case 12:
        case 32:
        case 60:
        case 38:
        case -1:
          R(i, Ct);
          break;
        case 35:
          U.push(i), g2 = gl;
          break;
        default:
          R(i, wi);
          break;
      }
    }
    function wi(i) {
      Ko.lastIndex = f2;
      var s = Ko.exec(n);
      if (!s)
        throw new Error("should never happen");
      var x = s[1];
      if (!x) {
        g2 = Ct;
        return;
      }
      switch (f2 += x.length, qt(U, J0(x)), re) {
        case qr:
        case Hr:
        case Fr:
          if (x[x.length - 1] !== ";" && /[=A-Za-z0-9]/.test(n[f2])) {
            g2 = Ct;
            return;
          }
          break;
      }
      at();
      var E = V0[x];
      typeof E == "number" ? U.push(E) : qt(U, E), g2 = Ct;
    }
    wi.lookahead = -z0;
    function gl(i) {
      switch ($2 = 0, i) {
        case 120:
        case 88:
          U.push(i), g2 = bl;
          break;
        default:
          R(i, _l);
          break;
      }
    }
    function bl(i) {
      switch (i) {
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
          R(i, El);
          break;
        default:
          R(i, Ct);
          break;
      }
    }
    function _l(i) {
      switch (i) {
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
          R(i, vl);
          break;
        default:
          R(i, Ct);
          break;
      }
    }
    function El(i) {
      switch (i) {
        case 65:
        case 66:
        case 67:
        case 68:
        case 69:
        case 70:
          $2 *= 16, $2 += i - 55;
          break;
        case 97:
        case 98:
        case 99:
        case 100:
        case 101:
        case 102:
          $2 *= 16, $2 += i - 87;
          break;
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
          $2 *= 16, $2 += i - 48;
          break;
        case 59:
          g2 = zr;
          break;
        default:
          R(i, zr);
          break;
      }
    }
    function vl(i) {
      switch (i) {
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
          $2 *= 10, $2 += i - 48;
          break;
        case 59:
          g2 = zr;
          break;
        default:
          R(i, zr);
          break;
      }
    }
    function zr(i) {
      $2 in $o ? $2 = $o[$2] : ($2 > 1114111 || $2 >= 55296 && $2 < 57344) && ($2 = 65533), at(), $2 <= 65535 ? U.push($2) : ($2 = $2 - 65536, U.push(55296 + ($2 >> 10)), U.push(56320 + ($2 & 1023))), R(i, Ct);
    }
    function Ct(i) {
      switch (re) {
        case qr:
        case Hr:
        case Fr:
          be += Ce(U);
          break;
        default:
          qt(u, U);
          break;
      }
      R(i, re);
    }
    function yl(i, s, x, E) {
      switch (i) {
        case 1:
          if (s = s.replace(Ht, ""), s.length === 0)
            return;
          break;
        case 4:
          L._appendChild(L.createComment(s));
          return;
        case 5:
          var v = s, N = x, F = E;
          L.appendChild(new O0(L, v, N, F)), m || v.toLowerCase() !== "html" || F0.test(N) || F && F.toLowerCase() === P0 || F === void 0 && jo.test(N) ? L._quirks = true : (B0.test(N) || F !== void 0 && jo.test(N)) && (L._limitedQuirks = true), k = ki;
          return;
      }
      L._quirks = true, k = ki, k(i, s, x, E);
    }
    function ki(i, s, x, E) {
      var v;
      switch (i) {
        case 1:
          if (s = s.replace(Ht, ""), s.length === 0)
            return;
          break;
        case 5:
          return;
        case 4:
          L._appendChild(L.createComment(s));
          return;
        case 2:
          if (s === "html") {
            v = ir(L, s, x), p.push(v), L.appendChild(v), k = jr;
            return;
          }
          break;
        case 3:
          switch (s) {
            case "html":
            case "head":
            case "body":
            case "br":
              break;
            default:
              return;
          }
      }
      v = ir(L, "html", null), p.push(v), L.appendChild(v), k = jr, k(i, s, x, E);
    }
    function jr(i, s, x, E) {
      switch (i) {
        case 1:
          if (s = s.replace(Ht, ""), s.length === 0)
            return;
          break;
        case 5:
          return;
        case 4:
          Qe(s);
          return;
        case 2:
          switch (s) {
            case "html":
              H(i, s, x, E);
              return;
            case "head":
              var v = B(s, x);
              se = v, k = fe;
              return;
          }
          break;
        case 3:
          switch (s) {
            case "html":
            case "head":
            case "body":
            case "br":
              break;
            default:
              return;
          }
      }
      jr(Ne, "head", null), k(i, s, x, E);
    }
    function fe(i, s, x, E) {
      switch (i) {
        case 1:
          var v = s.match(Ht);
          if (v && (Ze(v[0]), s = s.substring(v[0].length)), s.length === 0)
            return;
          break;
        case 4:
          Qe(s);
          return;
        case 5:
          return;
        case 2:
          switch (s) {
            case "html":
              H(i, s, x, E);
              return;
            case "meta":
            case "base":
            case "basefont":
            case "bgsound":
            case "link":
              B(s, x), p.pop();
              return;
            case "title":
              Mc(s, x);
              return;
            case "noscript":
              if (!c2) {
                B(s, x), k = Si;
                return;
              }
            case "noframes":
            case "style":
              or(s, x);
              return;
            case "script":
              Mr(function(N) {
                var F = ir(N, s, x);
                return F._parser_inserted = true, F._force_async = false, Xe && (F._already_started = true), Bt(), F;
              }), g2 = mt, Fe = k, k = Gr;
              return;
            case "template":
              B(s, x), d2.insertMarker(), h2 = false, k = Wn, Ge.push(k);
              return;
            case "head":
              return;
          }
          break;
        case 3:
          switch (s) {
            case "head":
              p.pop(), k = jn;
              return;
            case "body":
            case "html":
            case "br":
              break;
            case "template":
              if (!p.contains("template"))
                return;
              p.generateImpliedEndTags(null, "thorough"), p.popTag("template"), d2.clearToMarker(), Ge.pop(), sr();
              return;
            default:
              return;
          }
          break;
      }
      fe(W, "head", null), k(i, s, x, E);
    }
    function Si(i, s, x, E) {
      switch (i) {
        case 5:
          return;
        case 4:
          fe(i, s);
          return;
        case 1:
          var v = s.match(Ht);
          if (v && (fe(i, v[0]), s = s.substring(v[0].length)), s.length === 0)
            return;
          break;
        case 2:
          switch (s) {
            case "html":
              H(i, s, x, E);
              return;
            case "basefont":
            case "bgsound":
            case "link":
            case "meta":
            case "noframes":
            case "style":
              fe(i, s, x);
              return;
            case "head":
            case "noscript":
              return;
          }
          break;
        case 3:
          switch (s) {
            case "noscript":
              p.pop(), k = fe;
              return;
            case "br":
              break;
            default:
              return;
          }
          break;
      }
      Si(W, "noscript", null), k(i, s, x, E);
    }
    function jn(i, s, x, E) {
      switch (i) {
        case 1:
          var v = s.match(Ht);
          if (v && (Ze(v[0]), s = s.substring(v[0].length)), s.length === 0)
            return;
          break;
        case 4:
          Qe(s);
          return;
        case 5:
          return;
        case 2:
          switch (s) {
            case "html":
              H(i, s, x, E);
              return;
            case "body":
              B(s, x), h2 = false, k = H;
              return;
            case "frameset":
              B(s, x), k = Yn;
              return;
            case "base":
            case "basefont":
            case "bgsound":
            case "link":
            case "meta":
            case "noframes":
            case "script":
            case "style":
            case "template":
            case "title":
              p.push(se), fe(Ne, s, x), p.removeElement(se);
              return;
            case "head":
              return;
          }
          break;
        case 3:
          switch (s) {
            case "template":
              return fe(i, s, x, E);
            case "body":
            case "html":
            case "br":
              break;
            default:
              return;
          }
          break;
      }
      jn(Ne, "body", null), h2 = true, k(i, s, x, E);
    }
    function H(i, s, x, E) {
      var v, N, F, G;
      switch (i) {
        case 1:
          if (b2 && (s = s.replace(Sn, ""), s.length === 0))
            return;
          h2 && kn.test(s) && (h2 = false), Ae(), Ze(s);
          return;
        case 5:
          return;
        case 4:
          Qe(s);
          return;
        case -1:
          if (Ge.length)
            return Wn(i);
          St();
          return;
        case 2:
          switch (s) {
            case "html":
              if (p.contains("template"))
                return;
              nc(x, p.elements[0]);
              return;
            case "base":
            case "basefont":
            case "bgsound":
            case "link":
            case "meta":
            case "noframes":
            case "script":
            case "style":
            case "template":
            case "title":
              fe(Ne, s, x);
              return;
            case "body":
              if (v = p.elements[1], !v || !(v instanceof ee.HTMLBodyElement) || p.contains("template"))
                return;
              h2 = false, nc(x, v);
              return;
            case "frameset":
              if (!h2 || (v = p.elements[1], !v || !(v instanceof ee.HTMLBodyElement)))
                return;
              for (v.parentNode && v.parentNode.removeChild(v); !(p.top instanceof ee.HTMLHtmlElement); )
                p.pop();
              B(s, x), k = Yn;
              return;
            case "address":
            case "article":
            case "aside":
            case "blockquote":
            case "center":
            case "details":
            case "dialog":
            case "dir":
            case "div":
            case "dl":
            case "fieldset":
            case "figcaption":
            case "figure":
            case "footer":
            case "header":
            case "hgroup":
            case "main":
            case "nav":
            case "ol":
            case "p":
            case "section":
            case "summary":
            case "ul":
              p.inButtonScope("p") && H(W, "p"), B(s, x);
              return;
            case "menu":
              p.inButtonScope("p") && H(W, "p"), te(p.top, "menuitem") && p.pop(), B(s, x);
              return;
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
              p.inButtonScope("p") && H(W, "p"), p.top instanceof ee.HTMLHeadingElement && p.pop(), B(s, x);
              return;
            case "pre":
            case "listing":
              p.inButtonScope("p") && H(W, "p"), B(s, x), T = true, h2 = false;
              return;
            case "form":
              if (A && !p.contains("template"))
                return;
              p.inButtonScope("p") && H(W, "p"), G = B(s, x), p.contains("template") || (A = G);
              return;
            case "li":
              for (h2 = false, N = p.elements.length - 1; N >= 0; N--) {
                if (F = p.elements[N], F instanceof ee.HTMLLIElement) {
                  H(W, "li");
                  break;
                }
                if (te(F, Ft) && !te(F, ii))
                  break;
              }
              p.inButtonScope("p") && H(W, "p"), B(s, x);
              return;
            case "dd":
            case "dt":
              for (h2 = false, N = p.elements.length - 1; N >= 0; N--) {
                if (F = p.elements[N], te(F, ic)) {
                  H(W, F.localName);
                  break;
                }
                if (te(F, Ft) && !te(F, ii))
                  break;
              }
              p.inButtonScope("p") && H(W, "p"), B(s, x);
              return;
            case "plaintext":
              p.inButtonScope("p") && H(W, "p"), B(s, x), g2 = Or;
              return;
            case "button":
              p.inScope("button") ? (H(W, "button"), k(i, s, x, E)) : (Ae(), B(s, x), h2 = false);
              return;
            case "a":
              var le = d2.findElementByTag("a");
              le && (H(W, s), d2.remove(le), p.removeElement(le));
            case "b":
            case "big":
            case "code":
            case "em":
            case "font":
            case "i":
            case "s":
            case "small":
            case "strike":
            case "strong":
            case "tt":
            case "u":
              Ae(), d2.push(B(s, x), x);
              return;
            case "nobr":
              Ae(), p.inScope(s) && (H(W, s), Ae()), d2.push(B(s, x), x);
              return;
            case "applet":
            case "marquee":
            case "object":
              Ae(), B(s, x), d2.insertMarker(), h2 = false;
              return;
            case "table":
              !L._quirks && p.inButtonScope("p") && H(W, "p"), B(s, x), h2 = false, k = Ue;
              return;
            case "area":
            case "br":
            case "embed":
            case "img":
            case "keygen":
            case "wbr":
              Ae(), B(s, x), p.pop(), h2 = false;
              return;
            case "input":
              Ae(), G = B(s, x), p.pop();
              var ye = G.getAttribute("type");
              (!ye || ye.toLowerCase() !== "hidden") && (h2 = false);
              return;
            case "param":
            case "source":
            case "track":
              B(s, x), p.pop();
              return;
            case "hr":
              p.inButtonScope("p") && H(W, "p"), te(p.top, "menuitem") && p.pop(), B(s, x), p.pop(), h2 = false;
              return;
            case "image":
              H(Ne, "img", x, E);
              return;
            case "textarea":
              B(s, x), T = true, h2 = false, g2 = pt, Fe = k, k = Gr;
              return;
            case "xmp":
              p.inButtonScope("p") && H(W, "p"), Ae(), h2 = false, or(s, x);
              return;
            case "iframe":
              h2 = false, or(s, x);
              return;
            case "noembed":
              or(s, x);
              return;
            case "noscript":
              if (c2) {
                or(s, x);
                return;
              }
              break;
            case "select":
              Ae(), B(s, x), h2 = false, k === Ue || k === Gn || k === At || k === ur || k === Ut ? k = Yr : k = st;
              return;
            case "optgroup":
            case "option":
              p.top instanceof ee.HTMLOptionElement && H(W, "option"), Ae(), B(s, x);
              return;
            case "menuitem":
              te(p.top, "menuitem") && p.pop(), Ae(), B(s, x);
              return;
            case "rb":
            case "rtc":
              p.inScope("ruby") && p.generateImpliedEndTags(), B(s, x);
              return;
            case "rp":
            case "rt":
              p.inScope("ruby") && p.generateImpliedEndTags("rtc"), B(s, x);
              return;
            case "math":
              Ae(), rc(x), ai(x), On(s, x, q.MATHML), E && p.pop();
              return;
            case "svg":
              Ae(), tc(x), ai(x), On(s, x, q.SVG), E && p.pop();
              return;
            case "caption":
            case "col":
            case "colgroup":
            case "frame":
            case "head":
            case "tbody":
            case "td":
            case "tfoot":
            case "th":
            case "thead":
            case "tr":
              return;
          }
          Ae(), B(s, x);
          return;
        case 3:
          switch (s) {
            case "template":
              fe(W, s, x);
              return;
            case "body":
              if (!p.inScope("body"))
                return;
              k = Ni;
              return;
            case "html":
              if (!p.inScope("body"))
                return;
              k = Ni, k(i, s, x);
              return;
            case "address":
            case "article":
            case "aside":
            case "blockquote":
            case "button":
            case "center":
            case "details":
            case "dialog":
            case "dir":
            case "div":
            case "dl":
            case "fieldset":
            case "figcaption":
            case "figure":
            case "footer":
            case "header":
            case "hgroup":
            case "listing":
            case "main":
            case "menu":
            case "nav":
            case "ol":
            case "pre":
            case "section":
            case "summary":
            case "ul":
              if (!p.inScope(s))
                return;
              p.generateImpliedEndTags(), p.popTag(s);
              return;
            case "form":
              if (p.contains("template")) {
                if (!p.inScope("form"))
                  return;
                p.generateImpliedEndTags(), p.popTag("form");
              } else {
                var Ve = A;
                if (A = null, !Ve || !p.elementInScope(Ve))
                  return;
                p.generateImpliedEndTags(), p.removeElement(Ve);
              }
              return;
            case "p":
              p.inButtonScope(s) ? (p.generateImpliedEndTags(s), p.popTag(s)) : (H(Ne, s, null), k(i, s, x, E));
              return;
            case "li":
              if (!p.inListItemScope(s))
                return;
              p.generateImpliedEndTags(s), p.popTag(s);
              return;
            case "dd":
            case "dt":
              if (!p.inScope(s))
                return;
              p.generateImpliedEndTags(s), p.popTag(s);
              return;
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
              if (!p.elementTypeInScope(ee.HTMLHeadingElement))
                return;
              p.generateImpliedEndTags(), p.popElementType(ee.HTMLHeadingElement);
              return;
            case "sarcasm":
              break;
            case "a":
            case "b":
            case "big":
            case "code":
            case "em":
            case "font":
            case "i":
            case "nobr":
            case "s":
            case "small":
            case "strike":
            case "strong":
            case "tt":
            case "u":
              var Ye = Rc(s);
              if (Ye)
                return;
              break;
            case "applet":
            case "marquee":
            case "object":
              if (!p.inScope(s))
                return;
              p.generateImpliedEndTags(), p.popTag(s), d2.clearToMarker();
              return;
            case "br":
              H(Ne, s, null);
              return;
          }
          for (N = p.elements.length - 1; N >= 0; N--)
            if (F = p.elements[N], te(F, s)) {
              p.generateImpliedEndTags(s), p.popElement(F);
              break;
            } else if (te(F, Ft))
              return;
          return;
      }
    }
    function Gr(i, s, x, E) {
      switch (i) {
        case 1:
          Ze(s);
          return;
        case -1:
          p.top instanceof ee.HTMLScriptElement && (p.top._already_started = true), p.pop(), k = Fe, k(i);
          return;
        case 3:
          s === "script" ? Ic() : (p.pop(), k = Fe);
          return;
        default:
          return;
      }
    }
    function Ue(i, s, x, E) {
      function v(F) {
        for (var G = 0, le = F.length; G < le; G++)
          if (F[G][0] === "type")
            return F[G][1].toLowerCase();
        return null;
      }
      switch (i) {
        case 1:
          if (o) {
            H(i, s, x, E);
            return;
          } else if (te(p.top, tr)) {
            a = [], Fe = k, k = Tl, k(i, s, x, E);
            return;
          }
          break;
        case 4:
          Qe(s);
          return;
        case 5:
          return;
        case 2:
          switch (s) {
            case "caption":
              p.clearToContext(Nn), d2.insertMarker(), B(s, x), k = Gn;
              return;
            case "colgroup":
              p.clearToContext(Nn), B(s, x), k = Wr;
              return;
            case "col":
              Ue(Ne, "colgroup", null), k(i, s, x, E);
              return;
            case "tbody":
            case "tfoot":
            case "thead":
              p.clearToContext(Nn), B(s, x), k = At;
              return;
            case "td":
            case "th":
            case "tr":
              Ue(Ne, "tbody", null), k(i, s, x, E);
              return;
            case "table":
              if (!p.inTableScope(s))
                return;
              Ue(W, s), k(i, s, x, E);
              return;
            case "style":
            case "script":
            case "template":
              fe(i, s, x, E);
              return;
            case "input":
              var N = v(x);
              if (N !== "hidden")
                break;
              B(s, x), p.pop();
              return;
            case "form":
              if (A || p.contains("template"))
                return;
              A = B(s, x), p.popElement(A);
              return;
          }
          break;
        case 3:
          switch (s) {
            case "table":
              if (!p.inTableScope(s))
                return;
              p.popTag(s), sr();
              return;
            case "body":
            case "caption":
            case "col":
            case "colgroup":
            case "html":
            case "tbody":
            case "td":
            case "tfoot":
            case "th":
            case "thead":
            case "tr":
              return;
            case "template":
              fe(i, s, x, E);
              return;
          }
          break;
        case -1:
          H(i, s, x, E);
          return;
      }
      xt = true, H(i, s, x, E), xt = false;
    }
    function Tl(i, s, x, E) {
      if (i === er) {
        if (b2 && (s = s.replace(Sn, ""), s.length === 0))
          return;
        a.push(s);
      } else {
        var v = a.join("");
        a.length = 0, kn.test(v) ? (xt = true, H(er, v), xt = false) : Ze(v), k = Fe, k(i, s, x, E);
      }
    }
    function Gn(i, s, x, E) {
      function v() {
        return p.inTableScope("caption") ? (p.generateImpliedEndTags(), p.popTag("caption"), d2.clearToMarker(), k = Ue, true) : false;
      }
      switch (i) {
        case 2:
          switch (s) {
            case "caption":
            case "col":
            case "colgroup":
            case "tbody":
            case "td":
            case "tfoot":
            case "th":
            case "thead":
            case "tr":
              v() && k(i, s, x, E);
              return;
          }
          break;
        case 3:
          switch (s) {
            case "caption":
              v();
              return;
            case "table":
              v() && k(i, s, x, E);
              return;
            case "body":
            case "col":
            case "colgroup":
            case "html":
            case "tbody":
            case "td":
            case "tfoot":
            case "th":
            case "thead":
            case "tr":
              return;
          }
          break;
      }
      H(i, s, x, E);
    }
    function Wr(i, s, x, E) {
      switch (i) {
        case 1:
          var v = s.match(Ht);
          if (v && (Ze(v[0]), s = s.substring(v[0].length)), s.length === 0)
            return;
          break;
        case 4:
          Qe(s);
          return;
        case 5:
          return;
        case 2:
          switch (s) {
            case "html":
              H(i, s, x, E);
              return;
            case "col":
              B(s, x), p.pop();
              return;
            case "template":
              fe(i, s, x, E);
              return;
          }
          break;
        case 3:
          switch (s) {
            case "colgroup":
              if (!te(p.top, "colgroup"))
                return;
              p.pop(), k = Ue;
              return;
            case "col":
              return;
            case "template":
              fe(i, s, x, E);
              return;
          }
          break;
        case -1:
          H(i, s, x, E);
          return;
      }
      !te(p.top, "colgroup") || (Wr(W, "colgroup"), k(i, s, x, E));
    }
    function At(i, s, x, E) {
      function v() {
        !p.inTableScope("tbody") && !p.inTableScope("thead") && !p.inTableScope("tfoot") || (p.clearToContext(Cn), At(W, p.top.localName, null), k(i, s, x, E));
      }
      switch (i) {
        case 2:
          switch (s) {
            case "tr":
              p.clearToContext(Cn), B(s, x), k = ur;
              return;
            case "th":
            case "td":
              At(Ne, "tr", null), k(i, s, x, E);
              return;
            case "caption":
            case "col":
            case "colgroup":
            case "tbody":
            case "tfoot":
            case "thead":
              v();
              return;
          }
          break;
        case 3:
          switch (s) {
            case "table":
              v();
              return;
            case "tbody":
            case "tfoot":
            case "thead":
              p.inTableScope(s) && (p.clearToContext(Cn), p.pop(), k = Ue);
              return;
            case "body":
            case "caption":
            case "col":
            case "colgroup":
            case "html":
            case "td":
            case "th":
            case "tr":
              return;
          }
          break;
      }
      Ue(i, s, x, E);
    }
    function ur(i, s, x, E) {
      function v() {
        return p.inTableScope("tr") ? (p.clearToContext(si), p.pop(), k = At, true) : false;
      }
      switch (i) {
        case 2:
          switch (s) {
            case "th":
            case "td":
              p.clearToContext(si), B(s, x), k = Ut, d2.insertMarker();
              return;
            case "caption":
            case "col":
            case "colgroup":
            case "tbody":
            case "tfoot":
            case "thead":
            case "tr":
              v() && k(i, s, x, E);
              return;
          }
          break;
        case 3:
          switch (s) {
            case "tr":
              v();
              return;
            case "table":
              v() && k(i, s, x, E);
              return;
            case "tbody":
            case "tfoot":
            case "thead":
              p.inTableScope(s) && v() && k(i, s, x, E);
              return;
            case "body":
            case "caption":
            case "col":
            case "colgroup":
            case "html":
            case "td":
            case "th":
              return;
          }
          break;
      }
      Ue(i, s, x, E);
    }
    function Ut(i, s, x, E) {
      switch (i) {
        case 2:
          switch (s) {
            case "caption":
            case "col":
            case "colgroup":
            case "tbody":
            case "td":
            case "tfoot":
            case "th":
            case "thead":
            case "tr":
              p.inTableScope("td") ? (Ut(W, "td"), k(i, s, x, E)) : p.inTableScope("th") && (Ut(W, "th"), k(i, s, x, E));
              return;
          }
          break;
        case 3:
          switch (s) {
            case "td":
            case "th":
              if (!p.inTableScope(s))
                return;
              p.generateImpliedEndTags(), p.popTag(s), d2.clearToMarker(), k = ur;
              return;
            case "body":
            case "caption":
            case "col":
            case "colgroup":
            case "html":
              return;
            case "table":
            case "tbody":
            case "tfoot":
            case "thead":
            case "tr":
              if (!p.inTableScope(s))
                return;
              Ut(W, p.inTableScope("td") ? "td" : "th"), k(i, s, x, E);
              return;
          }
          break;
      }
      H(i, s, x, E);
    }
    function st(i, s, x, E) {
      switch (i) {
        case 1:
          if (b2 && (s = s.replace(Sn, ""), s.length === 0))
            return;
          Ze(s);
          return;
        case 4:
          Qe(s);
          return;
        case 5:
          return;
        case -1:
          H(i, s, x, E);
          return;
        case 2:
          switch (s) {
            case "html":
              H(i, s, x, E);
              return;
            case "option":
              p.top instanceof ee.HTMLOptionElement && st(W, s), B(s, x);
              return;
            case "optgroup":
              p.top instanceof ee.HTMLOptionElement && st(W, "option"), p.top instanceof ee.HTMLOptGroupElement && st(W, s), B(s, x);
              return;
            case "select":
              st(W, s);
              return;
            case "input":
            case "keygen":
            case "textarea":
              if (!p.inSelectScope("select"))
                return;
              st(W, "select"), k(i, s, x, E);
              return;
            case "script":
            case "template":
              fe(i, s, x, E);
              return;
          }
          break;
        case 3:
          switch (s) {
            case "optgroup":
              p.top instanceof ee.HTMLOptionElement && p.elements[p.elements.length - 2] instanceof ee.HTMLOptGroupElement && st(W, "option"), p.top instanceof ee.HTMLOptGroupElement && p.pop();
              return;
            case "option":
              p.top instanceof ee.HTMLOptionElement && p.pop();
              return;
            case "select":
              if (!p.inSelectScope(s))
                return;
              p.popTag(s), sr();
              return;
            case "template":
              fe(i, s, x, E);
              return;
          }
          break;
      }
    }
    function Yr(i, s, x, E) {
      switch (s) {
        case "caption":
        case "table":
        case "tbody":
        case "tfoot":
        case "thead":
        case "tr":
        case "td":
        case "th":
          switch (i) {
            case 2:
              Yr(W, "select"), k(i, s, x, E);
              return;
            case 3:
              p.inTableScope(s) && (Yr(W, "select"), k(i, s, x, E));
              return;
          }
      }
      st(i, s, x, E);
    }
    function Wn(i, s, x, E) {
      function v(N) {
        k = N, Ge[Ge.length - 1] = k, k(i, s, x, E);
      }
      switch (i) {
        case 1:
        case 4:
        case 5:
          H(i, s, x, E);
          return;
        case -1:
          p.contains("template") ? (p.popTag("template"), d2.clearToMarker(), Ge.pop(), sr(), k(i, s, x, E)) : St();
          return;
        case 2:
          switch (s) {
            case "base":
            case "basefont":
            case "bgsound":
            case "link":
            case "meta":
            case "noframes":
            case "script":
            case "style":
            case "template":
            case "title":
              fe(i, s, x, E);
              return;
            case "caption":
            case "colgroup":
            case "tbody":
            case "tfoot":
            case "thead":
              v(Ue);
              return;
            case "col":
              v(Wr);
              return;
            case "tr":
              v(At);
              return;
            case "td":
            case "th":
              v(ur);
              return;
          }
          v(H);
          return;
        case 3:
          switch (s) {
            case "template":
              fe(i, s, x, E);
              return;
            default:
              return;
          }
      }
    }
    function Ni(i, s, x, E) {
      switch (i) {
        case 1:
          if (kn.test(s))
            break;
          H(i, s);
          return;
        case 4:
          p.elements[0]._appendChild(L.createComment(s));
          return;
        case 5:
          return;
        case -1:
          St();
          return;
        case 2:
          if (s === "html") {
            H(i, s, x, E);
            return;
          }
          break;
        case 3:
          if (s === "html") {
            if (Xe)
              return;
            k = kl;
            return;
          }
          break;
      }
      k = H, k(i, s, x, E);
    }
    function Yn(i, s, x, E) {
      switch (i) {
        case 1:
          s = s.replace(ni, ""), s.length > 0 && Ze(s);
          return;
        case 4:
          Qe(s);
          return;
        case 5:
          return;
        case -1:
          St();
          return;
        case 2:
          switch (s) {
            case "html":
              H(i, s, x, E);
              return;
            case "frameset":
              B(s, x);
              return;
            case "frame":
              B(s, x), p.pop();
              return;
            case "noframes":
              fe(i, s, x, E);
              return;
          }
          break;
        case 3:
          if (s === "frameset") {
            if (Xe && p.top instanceof ee.HTMLHtmlElement)
              return;
            p.pop(), !Xe && !(p.top instanceof ee.HTMLFrameSetElement) && (k = wl);
            return;
          }
          break;
      }
    }
    function wl(i, s, x, E) {
      switch (i) {
        case 1:
          s = s.replace(ni, ""), s.length > 0 && Ze(s);
          return;
        case 4:
          Qe(s);
          return;
        case 5:
          return;
        case -1:
          St();
          return;
        case 2:
          switch (s) {
            case "html":
              H(i, s, x, E);
              return;
            case "noframes":
              fe(i, s, x, E);
              return;
          }
          break;
        case 3:
          if (s === "html") {
            k = Sl;
            return;
          }
          break;
      }
    }
    function kl(i, s, x, E) {
      switch (i) {
        case 1:
          if (kn.test(s))
            break;
          H(i, s, x, E);
          return;
        case 4:
          L._appendChild(L.createComment(s));
          return;
        case 5:
          H(i, s, x, E);
          return;
        case -1:
          St();
          return;
        case 2:
          if (s === "html") {
            H(i, s, x, E);
            return;
          }
          break;
      }
      k = H, k(i, s, x, E);
    }
    function Sl(i, s, x, E) {
      switch (i) {
        case 1:
          s = s.replace(ni, ""), s.length > 0 && H(i, s, x, E);
          return;
        case 4:
          L._appendChild(L.createComment(s));
          return;
        case 5:
          H(i, s, x, E);
          return;
        case -1:
          St();
          return;
        case 2:
          switch (s) {
            case "html":
              H(i, s, x, E);
              return;
            case "noframes":
              fe(i, s, x, E);
              return;
          }
          break;
      }
    }
    function Ci(i, s, x, E) {
      function v(le) {
        for (var ye = 0, Ve = le.length; ye < Ve; ye++)
          switch (le[ye][0]) {
            case "color":
            case "face":
            case "size":
              return true;
          }
        return false;
      }
      var N;
      switch (i) {
        case 1:
          h2 && Z0.test(s) && (h2 = false), b2 && (s = s.replace(Sn, "\uFFFD")), Ze(s);
          return;
        case 4:
          Qe(s);
          return;
        case 5:
          return;
        case 2:
          switch (s) {
            case "font":
              if (!v(x))
                break;
            case "b":
            case "big":
            case "blockquote":
            case "body":
            case "br":
            case "center":
            case "code":
            case "dd":
            case "div":
            case "dl":
            case "dt":
            case "em":
            case "embed":
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
            case "head":
            case "hr":
            case "i":
            case "img":
            case "li":
            case "listing":
            case "menu":
            case "meta":
            case "nobr":
            case "ol":
            case "p":
            case "pre":
            case "ruby":
            case "s":
            case "small":
            case "span":
            case "strong":
            case "strike":
            case "sub":
            case "sup":
            case "table":
            case "tt":
            case "u":
            case "ul":
            case "var":
              if (Xe)
                break;
              do
                p.pop(), N = p.top;
              while (N.namespaceURI !== q.HTML && !Jo(N) && !ec(N));
              pe(i, s, x, E);
              return;
          }
          N = p.elements.length === 1 && Xe ? t : p.top, N.namespaceURI === q.MATHML ? rc(x) : N.namespaceURI === q.SVG && (s = ef(s), tc(x)), ai(x), On(s, x, N.namespaceURI), E && (s === "script" && (N.namespaceURI, q.SVG), p.pop());
          return;
        case 3:
          if (N = p.top, s === "script" && N.namespaceURI === q.SVG && N.localName === "script")
            p.pop();
          else
            for (var F = p.elements.length - 1, G = p.elements[F]; ; ) {
              if (G.localName.toLowerCase() === s) {
                p.popElement(G);
                break;
              }
              if (G = p.elements[--F], G.namespaceURI === q.HTML) {
                k(i, s, x, E);
                break;
              }
            }
          return;
      }
    }
    return I.testTokenizer = function(i, s, x, E) {
      var v = [];
      switch (s) {
        case "PCDATA state":
          g2 = j;
          break;
        case "RCDATA state":
          g2 = pt;
          break;
        case "RAWTEXT state":
          g2 = cr;
          break;
        case "PLAINTEXT state":
          g2 = Or;
          break;
      }
      if (x && (ve = x), pe = function(F, G, le, ye) {
        switch (Bt(), F) {
          case 1:
            v.length > 0 && v[v.length - 1][0] === "Character" ? v[v.length - 1][1] += G : v.push(["Character", G]);
            break;
          case 4:
            v.push(["Comment", G]);
            break;
          case 5:
            v.push(["DOCTYPE", G, le === void 0 ? null : le, ye === void 0 ? null : ye, !m]);
            break;
          case 2:
            for (var Ve = /* @__PURE__ */ Object.create(null), Ye = 0; Ye < le.length; Ye++) {
              var Lt = le[Ye];
              Lt.length === 1 ? Ve[Lt[0]] = "" : Ve[Lt[0]] = Lt[1];
            }
            var Et = ["StartTag", G, Ve];
            ye && Et.push(true), v.push(Et);
            break;
          case 3:
            v.push(["EndTag", G]);
            break;
        }
      }, !E)
        this.parse(i, true);
      else {
        for (var N = 0; N < i.length; N++)
          this.parse(i[N]);
        this.parse("", true);
      }
      return v;
    }, I;
  }
});
var Nr = O((od, mc) => {
  mc.exports = pc;
  var hc = vn(), xc = Tn(), tf = Ln(), Dn = he(), rf = tn();
  function pc(e2) {
    this.contextObject = e2;
  }
  var nf = { xml: { "": true, "1.0": true, "2.0": true }, core: { "": true, "2.0": true }, html: { "": true, "1.0": true, "2.0": true }, xhtml: { "": true, "1.0": true, "2.0": true } };
  pc.prototype = { hasFeature: function(t, r) {
    var n = nf[(t || "").toLowerCase()];
    return n && n[r || ""] || false;
  }, createDocumentType: function(t, r, n) {
    return rf.isValidQName(t) || Dn.InvalidCharacterError(), new xc(this.contextObject, t, r, n);
  }, createDocument: function(t, r, n) {
    var l = new hc(false, null), f2;
    return r ? f2 = l.createElementNS(t, r) : f2 = null, n && l.appendChild(n), f2 && l.appendChild(f2), t === Dn.NAMESPACE.HTML ? l._contentType = "application/xhtml+xml" : t === Dn.NAMESPACE.SVG ? l._contentType = "image/svg+xml" : l._contentType = "application/xml", l;
  }, createHTMLDocument: function(t) {
    var r = new hc(true, null);
    r.appendChild(new xc(r, "html"));
    var n = r.createElement("html");
    r.appendChild(n);
    var l = r.createElement("head");
    if (n.appendChild(l), t !== void 0) {
      var f2 = r.createElement("title");
      l.appendChild(f2), f2.appendChild(r.createTextNode(t));
    }
    return n.appendChild(r.createElement("body")), r.modclock = 1, r;
  }, mozSetOutputMutationHandler: function(e2, t) {
    e2.mutationHandler = t;
  }, mozGetInputMutationHandler: function(e2) {
    Dn.nyi();
  }, mozHTMLParser: tf };
});
var bc = O((cd, gc) => {
  var af = xn(), sf = $a();
  gc.exports = ci;
  function ci(e2, t) {
    this._window = e2, this._href = t;
  }
  ci.prototype = Object.create(sf.prototype, { constructor: { value: ci }, href: { get: function() {
    return this._href;
  }, set: function(e2) {
    this.assign(e2);
  } }, assign: { value: function(e2) {
    var t = new af(this._href), r = t.resolve(e2);
    this._href = r;
  } }, replace: { value: function(e2) {
    this.assign(e2);
  } }, reload: { value: function() {
    this.assign(this.href);
  } }, toString: { value: function() {
    return this.href;
  } } });
});
var Ec = O((ld, _c) => {
  var of = Object.create(null, { appCodeName: { value: "Mozilla" }, appName: { value: "Netscape" }, appVersion: { value: "4.0" }, platform: { value: "" }, product: { value: "Gecko" }, productSub: { value: "20100101" }, userAgent: { value: "" }, vendor: { value: "" }, vendorSub: { value: "" }, taintEnabled: { value: function() {
    return false;
  } } });
  _c.exports = of;
});
var yc = O((ud, vc) => {
  var cf = { setTimeout, clearTimeout, setInterval, clearInterval };
  vc.exports = cf;
});
var ui = O((Cr, Tc) => {
  var li = he();
  Cr = Tc.exports = { CSSStyleDeclaration: pn(), CharacterData: _r(), Comment: Ra(), DOMException: Xr(), DOMImplementation: Nr(), DOMTokenList: ga(), Document: vn(), DocumentFragment: qa(), DocumentType: Tn(), Element: Kt(), HTMLParser: Ln(), NamedNodeMap: Ta(), Node: Te(), NodeList: It(), NodeFilter: Er(), ProcessingInstruction: Fa(), Text: Da(), Window: fi() };
  li.merge(Cr, Ya());
  li.merge(Cr, bn().elements);
  li.merge(Cr, Ja().elements);
});
var fi = O((fd, wc) => {
  var lf = Nr(), uf = Jn(), ff = bc(), Ar = he();
  wc.exports = Mn;
  function Mn(e2) {
    this.document = e2 || new lf(null).createHTMLDocument(""), this.document._scripting_enabled = true, this.document.defaultView = this, this.location = new ff(this, this.document._address || "about:blank");
  }
  Mn.prototype = Object.create(uf.prototype, { console: { value: console }, history: { value: { back: Ar.nyi, forward: Ar.nyi, go: Ar.nyi } }, navigator: { value: Ec() }, window: { get: function() {
    return this;
  } }, self: { get: function() {
    return this;
  } }, frames: { get: function() {
    return this;
  } }, parent: { get: function() {
    return this;
  } }, top: { get: function() {
    return this;
  } }, length: { value: 0 }, frameElement: { value: null }, opener: { value: null }, onload: { get: function() {
    return this._getEventHandler("load");
  }, set: function(e2) {
    this._setEventHandler("load", e2);
  } }, getComputedStyle: { value: function(t) {
    return t.style;
  } } });
  Ar.expose(yc(), Mn);
  Ar.expose(ui(), Mn);
});
var df = O((Lr) => {
  var kc = Nr(), Sc = Ln();
  fi();
  Lr.createDOMImplementation = function() {
    return new kc(null);
  };
  Lr.createDocument = function(e2, t) {
    if (e2 || t) {
      var r = new Sc();
      return r.parse(e2 || "", true), r.document();
    }
    return new kc(null).createHTMLDocument("");
  };
  Lr.createIncrementalHTMLParser = function() {
    var e2 = new Sc();
    return { write: function(t) {
      t.length > 0 && e2.parse(t, false, function() {
        return true;
      });
    }, end: function(t) {
      e2.parse(t || "", true, function() {
        return true;
      });
    }, process: function(t) {
      return e2.parse("", false, t);
    }, document: function() {
      return e2.document();
    } };
  };
  Lr.impl = ui();
});
var qwikdom_default = df();
var _setImmediate = typeof setImmediate === "function" ? setImmediate : setTimeout;
function createPlatform(document2, opts) {
  if (!document2 || document2.nodeType !== 9) {
    throw new Error(`Invalid Document implementation`);
  }
  const doc = document2;
  const symbols = opts.symbols || Q_SYMBOLS_ENTRY_MAP;
  if (opts == null ? void 0 : opts.url) {
    doc.location.href = normalizeUrl(opts.url).href;
  }
  const serverPlatform = {
    async importSymbol(_element, qrl2, symbolName) {
      let [modulePath] = String(qrl2).split("#");
      if (!modulePath.endsWith(".js")) {
        modulePath += ".js";
      }
      const module = __require(modulePath);
      const symbol = module[symbolName];
      if (!symbol) {
        throw new Error(`Q-ERROR: missing symbol '${symbolName}' in module '${modulePath}'.`);
      }
      return symbol;
    },
    raf: (fn) => {
      return new Promise((resolve) => {
        _setImmediate(() => {
          resolve(fn());
        });
      });
    },
    nextTick: (fn) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fn());
        });
      });
    },
    chunkForSymbol(symbolName) {
      if (symbols) {
        if (typeof symbols === "object" && typeof symbols.mapping === "object") {
          return symbols.mapping[symbolName];
        }
        if (typeof symbols === "function") {
          return symbols(symbolName);
        }
      }
      return void 0;
    }
  };
  return serverPlatform;
}
async function setServerPlatform(document2, opts) {
  const platform = createPlatform(document2, opts);
  setPlatform(document2, platform);
}
var Q_SYMBOLS_ENTRY_MAP = {"version":"1","mapping":{"Nav_render":"q-057bd8b3.js","StoryPreview_render":"q-fa8feb9b.js","Toggle_onRender_a_onClick":"q-d107df41.js","Toggle_render":"q-d107df41.js","Comment_render":"q-687ff0d6.js","Stories_render":"q-68c9a35b.js","Story_render":"q-50e21ffc.js","User_render":"q-b4ed1736.js"},"injections":[]};
function isDocument(value) {
  return value && value.nodeType == 9;
}
function serializeDocument(docOrEl, opts) {
  if (!isDocument(docOrEl)) {
    return docOrEl.outerHTML;
  }
  const symbols = opts == null ? void 0 : opts.symbols;
  if (typeof symbols === "object" && symbols != null) {
    if (symbols.injections) {
      for (const injection of symbols.injections) {
        const el = docOrEl.createElement(injection.tag);
        if (injection.attributes) {
          Object.entries(injection.attributes).forEach(([attr, value]) => {
            el.setAttribute(attr, value);
          });
        }
        if (injection.children) {
          el.textContent = injection.children;
        }
        const parent = injection.location === "head" ? docOrEl.head : docOrEl.body;
        parent.appendChild(el);
      }
    }
  }
  return "<!DOCTYPE html>" + docOrEl.documentElement.outerHTML;
}
var qDev = globalThis.qDev !== false;
var STYLE = qDev ? `background: #564CE0; color: white; padding: 2px 3px; border-radius: 2px; font-size: 0.8em;` : "";
var logError = (message, ...optionalParams) => {
  console.error("%cQWIK ERROR", STYLE, message, ...optionalParams);
};
function assertDefined(value, text) {
  if (qDev) {
    if (value != null)
      return;
    throw newError(text || "Expected defined value.");
  }
}
function newError(text) {
  debugger;
  const error = new Error(text);
  logError(error);
  return error;
}
function getDocument(node) {
  if (typeof document !== "undefined") {
    return document;
  }
  if (node.nodeType === 9) {
    return node;
  }
  let doc = node.ownerDocument;
  while (doc && doc.nodeType !== 9) {
    doc = doc.parentNode;
  }
  assertDefined(doc);
  return doc;
}
var EMPTY_ARRAY = [];
var EMPTY_OBJ = {};
if (qDev) {
  Object.freeze(EMPTY_ARRAY);
  Object.freeze(EMPTY_OBJ);
}
Error.stackTraceLimit = 9999;
function getElement(docOrElm) {
  return isDocument(docOrElm) ? docOrElm.documentElement : docOrElm;
}
var QWIK_LOADER_DEFAULT_MINIFIED = `((e,t,n)=>{const o="__q_context__",r=["on:","on-window:","on-document:"],s=(t,n,o)=>{n=n.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),e.querySelectorAll("[on"+t+"\\\\:"+n+"]").forEach((e=>l(e,n,o)))},a=(e,t)=>e.dispatchEvent(new CustomEvent("qSymbol",{detail:{name:t},bubbles:!0,composed:!0})),c=e=>{throw Error("QWIK "+e)},i=(t,n)=>(t=t.closest("[q\\\\:container]"),new URL(n,new URL(t?t.getAttribute("q:base"):e.baseURI,e.baseURI))),l=async(t,n,s)=>{for(const l of r){const r=t.getAttribute(l+n);if(r){t.hasAttribute("preventdefault:"+n)&&s.preventDefault();for(const n of r.split("\\n")){const r=i(t,n);if(r){const n=p(r),i=(window[r.pathname]||await import(r.href.split("#")[0]))[n]||c(r+" does not export "+n),l=e[o];try{e[o]=[t,s,r],i(s,t,r)}finally{e[o]=l,a(t,n)}}}}}},p=e=>e.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",u=(t,n)=>{if((n=t.target)==e)setTimeout((()=>s("-document",t.type,t)));else for(;n&&n.getAttribute;)l(n,t.type,t),n=t.bubbles?n.parentElement:null},f=e=>(n||(n=new Worker(URL.createObjectURL(new Blob(['addEventListener("message",(e=>e.data.map((e=>fetch(e)))));'],{type:"text/javascript"})))),n.postMessage(e.getAttribute("q:prefetch").split("\\n").map((t=>i(e,t)+""))),n),d=n=>{n=e.readyState,t||"interactive"!=n&&"complete"!=n||(t=1,s("","q-resume",new CustomEvent("qResume")),e.querySelectorAll("[q\\\\:prefetch]").forEach(f))},b=t=>e.addEventListener(t,u,{capture:!0});if(!e.qR){e.qR=1;{const t=e.querySelector("script[events]");if(t)t.getAttribute("events").split(/[\\s,;]+/).forEach(b);else for(const t in e)t.startsWith("on")&&b(t.slice(2))}e.addEventListener("readystatechange",d),d()}})(document);`;
var QWIK_LOADER_DEFAULT_DEBUG = `(() => {
    ((doc, hasInitialized, prefetchWorker) => {
        const ON_PREFIXES = [ "on:", "on-window:", "on-document:" ];
        const broadcast = (infix, type, ev) => {
            type = type.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));
            doc.querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, type, ev)));
        };
        const symbolUsed = (el, symbolName) => el.dispatchEvent(new CustomEvent("qSymbol", {
            detail: {
                name: symbolName
            },
            bubbles: !0,
            composed: !0
        }));
        const error = msg => {
            throw new Error("QWIK " + msg);
        };
        const qrlResolver = (element, qrl) => {
            element = element.closest("[q\\\\:container]");
            return new URL(qrl, new URL(element ? element.getAttribute("q:base") : doc.baseURI, doc.baseURI));
        };
        const dispatch = async (element, eventName, ev) => {
            for (const onPrefix of ON_PREFIXES) {
                const attrValue = element.getAttribute(onPrefix + eventName);
                if (attrValue) {
                    element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();
                    for (const qrl of attrValue.split("\\n")) {
                        const url = qrlResolver(element, qrl);
                        if (url) {
                            const symbolName = getSymbolName(url);
                            const handler = (window[url.pathname] || await import(url.href.split("#")[0]))[symbolName] || error(url + " does not export " + symbolName);
                            const previousCtx = doc.__q_context__;
                            try {
                                doc.__q_context__ = [ element, ev, url ];
                                handler(ev, element, url);
                            } finally {
                                doc.__q_context__ = previousCtx;
                                symbolUsed(element, symbolName);
                            }
                        }
                    }
                }
            }
        };
        const getSymbolName = url => url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";
        const processEvent = (ev, element) => {
            if ((element = ev.target) == doc) {
                setTimeout((() => broadcast("-document", ev.type, ev)));
            } else {
                while (element && element.getAttribute) {
                    dispatch(element, ev.type, ev);
                    element = ev.bubbles ? element.parentElement : null;
                }
            }
        };
        const qrlPrefetch = element => {
            prefetchWorker || (prefetchWorker = new Worker(URL.createObjectURL(new Blob([ 'addEventListener("message",(e=>e.data.map((e=>fetch(e)))));' ], {
                type: "text/javascript"
            }))));
            prefetchWorker.postMessage(element.getAttribute("q:prefetch").split("\\n").map((qrl => qrlResolver(element, qrl) + "")));
            return prefetchWorker;
        };
        const processReadyStateChange = readyState => {
            readyState = doc.readyState;
            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {
                hasInitialized = 1;
                broadcast("", "q-resume", new CustomEvent("qResume"));
                doc.querySelectorAll("[q\\\\:prefetch]").forEach(qrlPrefetch);
            }
        };
        const addDocEventListener = eventName => doc.addEventListener(eventName, processEvent, {
            capture: !0
        });
        if (!doc.qR) {
            doc.qR = 1;
            {
                const scriptTag = doc.querySelector("script[events]");
                if (scriptTag) {
                    scriptTag.getAttribute("events").split(/[\\s,;]+/).forEach(addDocEventListener);
                } else {
                    for (const key in doc) {
                        key.startsWith("on") && addDocEventListener(key.slice(2));
                    }
                }
            }
            doc.addEventListener("readystatechange", processReadyStateChange);
            processReadyStateChange();
        }
    })(document);
})();`;
var QWIK_LOADER_OPTIMIZE_MINIFIED = `((e,t,n)=>{const o="__q_context__",a=["on:","on-window:","on-document:"],r=(t,n,o)=>{n=n.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),e.querySelectorAll("[on"+t+"\\\\:"+n+"]").forEach((e=>l(e,n,o)))},s=(e,t)=>e.dispatchEvent(new CustomEvent("qSymbol",{detail:{name:t},bubbles:!0,composed:!0})),c=e=>{throw Error("QWIK "+e)},i=(t,n)=>(t=t.closest("[q\\\\:container]"),new URL(n,new URL(t?t.getAttribute("q:base"):e.baseURI,e.baseURI))),l=async(t,n,r)=>{for(const l of a){const a=t.getAttribute(l+n);if(a){t.hasAttribute("preventdefault:"+n)&&r.preventDefault();for(const n of a.split("\\n")){const a=i(t,n);if(a){const n=p(a),i=(window[a.pathname]||await import(a.href.split("#")[0]))[n]||c(a+" does not export "+n),l=e[o];try{e[o]=[t,r,a],i(r,t,a)}finally{e[o]=l,s(t,n)}}}}}},p=e=>e.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",u=(t,n)=>{if((n=t.target)==e)setTimeout((()=>r("-document",t.type,t)));else for(;n&&n.getAttribute;)l(n,t.type,t),n=t.bubbles?n.parentElement:null},d=e=>(n||(n=new Worker(URL.createObjectURL(new Blob(['addEventListener("message",(e=>e.data.map((e=>fetch(e)))));'],{type:"text/javascript"})))),n.postMessage(e.getAttribute("q:prefetch").split("\\n").map((t=>i(e,t)+""))),n),f=n=>{n=e.readyState,t||"interactive"!=n&&"complete"!=n||(t=1,r("","q-resume",new CustomEvent("qResume")),e.querySelectorAll("[q\\\\:prefetch]").forEach(d))};e.qR||(e.qR=1,window.qEvents.forEach((t=>e.addEventListener(t,u,{capture:!0}))),e.addEventListener("readystatechange",f),f())})(document);`;
var QWIK_LOADER_OPTIMIZE_DEBUG = `(() => {
    ((doc, hasInitialized, prefetchWorker) => {
        const ON_PREFIXES = [ "on:", "on-window:", "on-document:" ];
        const broadcast = (infix, type, ev) => {
            type = type.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));
            doc.querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, type, ev)));
        };
        const symbolUsed = (el, symbolName) => el.dispatchEvent(new CustomEvent("qSymbol", {
            detail: {
                name: symbolName
            },
            bubbles: !0,
            composed: !0
        }));
        const error = msg => {
            throw new Error("QWIK " + msg);
        };
        const qrlResolver = (element, qrl) => {
            element = element.closest("[q\\\\:container]");
            return new URL(qrl, new URL(element ? element.getAttribute("q:base") : doc.baseURI, doc.baseURI));
        };
        const dispatch = async (element, eventName, ev) => {
            for (const onPrefix of ON_PREFIXES) {
                const attrValue = element.getAttribute(onPrefix + eventName);
                if (attrValue) {
                    element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();
                    for (const qrl of attrValue.split("\\n")) {
                        const url = qrlResolver(element, qrl);
                        if (url) {
                            const symbolName = getSymbolName(url);
                            const handler = (window[url.pathname] || await import(url.href.split("#")[0]))[symbolName] || error(url + " does not export " + symbolName);
                            const previousCtx = doc.__q_context__;
                            try {
                                doc.__q_context__ = [ element, ev, url ];
                                handler(ev, element, url);
                            } finally {
                                doc.__q_context__ = previousCtx;
                                symbolUsed(element, symbolName);
                            }
                        }
                    }
                }
            }
        };
        const getSymbolName = url => url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";
        const processEvent = (ev, element) => {
            if ((element = ev.target) == doc) {
                setTimeout((() => broadcast("-document", ev.type, ev)));
            } else {
                while (element && element.getAttribute) {
                    dispatch(element, ev.type, ev);
                    element = ev.bubbles ? element.parentElement : null;
                }
            }
        };
        const qrlPrefetch = element => {
            prefetchWorker || (prefetchWorker = new Worker(URL.createObjectURL(new Blob([ 'addEventListener("message",(e=>e.data.map((e=>fetch(e)))));' ], {
                type: "text/javascript"
            }))));
            prefetchWorker.postMessage(element.getAttribute("q:prefetch").split("\\n").map((qrl => qrlResolver(element, qrl) + "")));
            return prefetchWorker;
        };
        const processReadyStateChange = readyState => {
            readyState = doc.readyState;
            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {
                hasInitialized = 1;
                broadcast("", "q-resume", new CustomEvent("qResume"));
                doc.querySelectorAll("[q\\\\:prefetch]").forEach(qrlPrefetch);
            }
        };
        const addDocEventListener = eventName => doc.addEventListener(eventName, processEvent, {
            capture: !0
        });
        if (!doc.qR) {
            doc.qR = 1;
            window.qEvents.forEach(addDocEventListener);
            doc.addEventListener("readystatechange", processReadyStateChange);
            processReadyStateChange();
        }
    })(document);
})();`;
function getQwikLoaderScript(opts = {}) {
  if (Array.isArray(opts.events) && opts.events.length > 0) {
    const loader = opts.debug ? QWIK_LOADER_OPTIMIZE_DEBUG : QWIK_LOADER_OPTIMIZE_MINIFIED;
    return loader.replace("window.qEvents", JSON.stringify(opts.events));
  }
  return opts.debug ? QWIK_LOADER_DEFAULT_DEBUG : QWIK_LOADER_DEFAULT_MINIFIED;
}
function createWindow(opts) {
  opts = opts || {};
  const doc = qwikdom_default.createDocument(opts.html);
  const glb = ensureGlobals(doc, opts);
  return glb;
}
function createDocument(opts) {
  return createWindow(opts).document;
}
async function renderToDocument(docOrElm, rootNode, opts = {}) {
  var _a;
  const doc = isDocument(docOrElm) ? docOrElm : getDocument(docOrElm);
  ensureGlobals(doc, opts);
  await setServerPlatform(doc, opts);
  await render$1(docOrElm, rootNode);
  if (typeof opts.base === "string") {
    let qrlBase = opts.base;
    if (!qrlBase.endsWith("/")) {
      qrlBase += "/";
    }
    const containerEl = getElement(docOrElm);
    containerEl.setAttribute("q:base", qrlBase);
  }
  if (opts.snapshot !== false) {
    pauseContainer(docOrElm);
  }
  if (!opts.qwikLoader || opts.qwikLoader.include !== false) {
    const qwikLoaderScript = getQwikLoaderScript({
      events: (_a = opts.qwikLoader) == null ? void 0 : _a.events,
      debug: opts.debug
    });
    const scriptElm = doc.createElement("script");
    scriptElm.setAttribute("id", "qwikloader");
    scriptElm.innerHTML = qwikLoaderScript;
    doc.head.appendChild(scriptElm);
  }
}
async function renderToString(rootNode, opts = {}) {
  const createDocTimer = createTimer();
  const doc = createDocument(opts);
  const createDocTime = createDocTimer();
  const renderDocTimer = createTimer();
  let rootEl = doc;
  if (typeof opts.fragmentTagName === "string") {
    if (opts.qwikLoader) {
      opts.qwikLoader.include = false;
    } else {
      opts.qwikLoader = { include: false };
    }
    rootEl = doc.createElement(opts.fragmentTagName);
    doc.body.appendChild(rootEl);
  }
  await renderToDocument(rootEl, rootNode, opts);
  const renderDocTime = renderDocTimer();
  const docToStringTimer = createTimer();
  const result = {
    html: serializeDocument(rootEl, opts),
    timing: {
      createDocument: createDocTime,
      render: renderDocTime,
      toString: docToStringTimer()
    }
  };
  return result;
}
/*!
Parser-Lib
Copyright (c) 2009-2011 Nicholas C. Zakas. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
const b = { top: "news", new: "newest", show: "show", ask: "ask", job: "jobs" };
function getStory(a) {
  return c(`https://node-hnapi.herokuapp.com/item/${a}`);
}
function getUser(a) {
  return c(`https://hacker-news.firebaseio.com/v0/user/${a}.json`);
}
function getStories(d2, e2) {
  const a = b[d2];
  return a ? c(`https://node-hnapi.herokuapp.com/${a}?page=${e2}`) : [];
}
async function c(b2) {
  const c2 = await fetch(b2, { headers: { "User-Agent": "chrome" } });
  return c2.json().then((b3) => JSON.parse(JSON.stringify(b3), (c3, b4) => "object" == typeof b4 && b4 ? noSerialize(b4) : b4));
}
const Nav = /* @__PURE__ */ componentQrl(qrl(() => Promise.resolve().then(function() {
  return entry_Nav;
}), "Nav_render"), { tagName: "nav" });
const StoryPreview = /* @__PURE__ */ componentQrl(qrl(() => Promise.resolve().then(function() {
  return entry_StoryPreview;
}), "StoryPreview_render"), { tagName: "story-preview" });
const Toggle = /* @__PURE__ */ componentQrl(qrl(() => Promise.resolve().then(function() {
  return entry_Toggle;
}), "Toggle_render"));
const Comment = /* @__PURE__ */ componentQrl(qrl(() => Promise.resolve().then(function() {
  return entry_Comment;
}), "Comment_render"), { tagName: "comment" });
const Stories = /* @__PURE__ */ componentQrl(qrl(() => Promise.resolve().then(function() {
  return entry_Stories;
}), "Stories_render"), { tagName: "stories" });
const Story = /* @__PURE__ */ componentQrl(qrl(() => Promise.resolve().then(function() {
  return entry_Story;
}), "Story_render"), { tagName: "story" });
const User = /* @__PURE__ */ componentQrl(qrl(() => Promise.resolve().then(function() {
  return entry_User;
}), "User_render"), { tagName: "user " });
const g = { stories: Stories, story: Story, user: User };
function h$1(a) {
  const b2 = g[a.page];
  return /* @__PURE__ */ jsx("html", { children: [/* @__PURE__ */ jsx("head", { children: [/* @__PURE__ */ jsx("title", { children: "Qwik Hackernews" }), /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), /* @__PURE__ */ jsx("meta", { name: "description", content: "Hacker News Clone built with Qwik" }), /* @__PURE__ */ jsx("link", { rel: "stylesheet", href: "/index.css" })] }), /* @__PURE__ */ jsx("body", { children: [/* @__PURE__ */ jsx(Nav, {}), /* @__PURE__ */ jsx(b2, { url: a.url, param: a.params, data: a.data })] })] });
}
const REGEX_PARAM_DEFAULT = /^[^/]+/;
const REGEX_START_WITH_PARAM = /^(:\w|\()/;
const REGEX_INCLUDE_PARAM = /:\w|\(/;
const REGEX_MATCH_PARAM = /^(?::(\w+))?(?:\(([^)]+)\))?/;
class Router {
  constructor(routes) {
    this.root = this.createNode();
    if (routes) {
      Object.entries(routes).forEach((route) => this.add(...route));
    }
  }
  createNode({ regex, param, handler } = {}) {
    return {
      regex,
      param,
      handler,
      children: {
        string: {},
        regex: {}
      }
    };
  }
  add(pattern, handler) {
    this.parseOptim(pattern, handler, this.root);
    return this;
  }
  parseOptim(remain, handler, node) {
    if (REGEX_INCLUDE_PARAM.test(remain)) {
      this.parse(remain, handler, node);
    } else {
      const child = node.children.string[remain];
      if (child) {
        child.handler = handler;
      } else {
        node.children.string[remain] = this.createNode({ handler });
      }
    }
  }
  parse(remain, handler, parent) {
    if (REGEX_START_WITH_PARAM.test(remain)) {
      const match = remain.match(REGEX_MATCH_PARAM);
      if (match) {
        let node = parent.children.regex[match[0]];
        if (!node) {
          node = parent.children.regex[match[0]] = this.createNode({
            regex: match[2] ? new RegExp("^" + match[2]) : REGEX_PARAM_DEFAULT,
            param: match[1]
          });
        }
        if (match[0].length === remain.length) {
          node.handler = handler;
        } else {
          this.parseOptim(remain.slice(match[0].length), handler, node);
        }
      }
    } else {
      const char = remain[0];
      let node = parent.children.string[char];
      if (!node) {
        node = parent.children.string[char] = this.createNode();
      }
      this.parse(remain.slice(1), handler, node);
    }
  }
  find(path) {
    return this.findOptim(path, this.root, {});
  }
  findOptim(remain, node, params) {
    const child = node.children.string[remain];
    if (child && child.handler !== void 0) {
      return {
        handler: child.handler,
        params
      };
    }
    return this.findRecursive(remain, node, params);
  }
  findRecursive(remain, node, params) {
    let child = node.children.string[remain[0]];
    if (child) {
      const result = this.findRecursive(remain.slice(1), child, params);
      if (result) {
        return result;
      }
    }
    for (const k in node.children.regex) {
      child = node.children.regex[k];
      if (child.regex) {
        const match = remain.match(child.regex);
        if (match) {
          if (match[0].length === remain.length && child.handler !== void 0) {
            if (child.param) {
              params[child.param] = decodeURIComponent(match[0]);
            }
            return {
              handler: child.handler,
              params
            };
          } else {
            const result = this.findOptim(remain.slice(match[0].length), child, params);
            if (result) {
              if (child.param) {
                params[child.param] = decodeURIComponent(match[0]);
              }
              return result;
            }
          }
        }
      }
    }
    return null;
  }
}
const h = new Router({ "/stories/:id": { page: "story", getData(b2, a) {
  return getStory(a.id);
} }, "/users/:id": { page: "user", getData(b2, a) {
  return getUser(a.id);
} }, "(.*)": { page: "stories", async getData(e2) {
  const { searchParams: a } = e2, b2 = a.get("type") || "top", c2 = parseInt(a.get("page"), 10) || 1, f2 = await getStories(b2, c2);
  return { type: b2, page: c2, stories: f2 };
} } });
async function render(a) {
  const d2 = a.url.pathname + a.url.search, { handler: { page: f2, getData: i }, params: e2 } = h.find(d2), j = await i(a.url, e2);
  return renderToString(/* @__PURE__ */ jsx(h$1, { page: f2, url: d2, data: j, params: e2 }), { ...a });
}
var dist = {};
function Mime$1() {
  this._types = /* @__PURE__ */ Object.create(null);
  this._extensions = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }
  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}
Mime$1.prototype.define = function(typeMap, force) {
  for (let type in typeMap) {
    let extensions = typeMap[type].map(function(t) {
      return t.toLowerCase();
    });
    type = type.toLowerCase();
    for (let i = 0; i < extensions.length; i++) {
      const ext = extensions[i];
      if (ext[0] === "*") {
        continue;
      }
      if (!force && ext in this._types) {
        throw new Error('Attempt to change mapping for "' + ext + '" extension from "' + this._types[ext] + '" to "' + type + '". Pass `force=true` to allow this, otherwise remove "' + ext + '" from the list of extensions for "' + type + '".');
      }
      this._types[ext] = type;
    }
    if (force || !this._extensions[type]) {
      const ext = extensions[0];
      this._extensions[type] = ext[0] !== "*" ? ext : ext.substr(1);
    }
  }
};
Mime$1.prototype.getType = function(path) {
  path = String(path);
  let last = path.replace(/^.*[/\\]/, "").toLowerCase();
  let ext = last.replace(/^.*\./, "").toLowerCase();
  let hasPath = last.length < path.length;
  let hasDot = ext.length < last.length - 1;
  return (hasDot || !hasPath) && this._types[ext] || null;
};
Mime$1.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};
var Mime_1 = Mime$1;
var standard = { "application/andrew-inset": ["ez"], "application/applixware": ["aw"], "application/atom+xml": ["atom"], "application/atomcat+xml": ["atomcat"], "application/atomdeleted+xml": ["atomdeleted"], "application/atomsvc+xml": ["atomsvc"], "application/atsc-dwd+xml": ["dwd"], "application/atsc-held+xml": ["held"], "application/atsc-rsat+xml": ["rsat"], "application/bdoc": ["bdoc"], "application/calendar+xml": ["xcs"], "application/ccxml+xml": ["ccxml"], "application/cdfx+xml": ["cdfx"], "application/cdmi-capability": ["cdmia"], "application/cdmi-container": ["cdmic"], "application/cdmi-domain": ["cdmid"], "application/cdmi-object": ["cdmio"], "application/cdmi-queue": ["cdmiq"], "application/cu-seeme": ["cu"], "application/dash+xml": ["mpd"], "application/davmount+xml": ["davmount"], "application/docbook+xml": ["dbk"], "application/dssc+der": ["dssc"], "application/dssc+xml": ["xdssc"], "application/ecmascript": ["es", "ecma"], "application/emma+xml": ["emma"], "application/emotionml+xml": ["emotionml"], "application/epub+zip": ["epub"], "application/exi": ["exi"], "application/express": ["exp"], "application/fdt+xml": ["fdt"], "application/font-tdpfr": ["pfr"], "application/geo+json": ["geojson"], "application/gml+xml": ["gml"], "application/gpx+xml": ["gpx"], "application/gxf": ["gxf"], "application/gzip": ["gz"], "application/hjson": ["hjson"], "application/hyperstudio": ["stk"], "application/inkml+xml": ["ink", "inkml"], "application/ipfix": ["ipfix"], "application/its+xml": ["its"], "application/java-archive": ["jar", "war", "ear"], "application/java-serialized-object": ["ser"], "application/java-vm": ["class"], "application/javascript": ["js", "mjs"], "application/json": ["json", "map"], "application/json5": ["json5"], "application/jsonml+json": ["jsonml"], "application/ld+json": ["jsonld"], "application/lgr+xml": ["lgr"], "application/lost+xml": ["lostxml"], "application/mac-binhex40": ["hqx"], "application/mac-compactpro": ["cpt"], "application/mads+xml": ["mads"], "application/manifest+json": ["webmanifest"], "application/marc": ["mrc"], "application/marcxml+xml": ["mrcx"], "application/mathematica": ["ma", "nb", "mb"], "application/mathml+xml": ["mathml"], "application/mbox": ["mbox"], "application/mediaservercontrol+xml": ["mscml"], "application/metalink+xml": ["metalink"], "application/metalink4+xml": ["meta4"], "application/mets+xml": ["mets"], "application/mmt-aei+xml": ["maei"], "application/mmt-usd+xml": ["musd"], "application/mods+xml": ["mods"], "application/mp21": ["m21", "mp21"], "application/mp4": ["mp4s", "m4p"], "application/msword": ["doc", "dot"], "application/mxf": ["mxf"], "application/n-quads": ["nq"], "application/n-triples": ["nt"], "application/node": ["cjs"], "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"], "application/oda": ["oda"], "application/oebps-package+xml": ["opf"], "application/ogg": ["ogx"], "application/omdoc+xml": ["omdoc"], "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"], "application/oxps": ["oxps"], "application/p2p-overlay+xml": ["relo"], "application/patch-ops-error+xml": ["xer"], "application/pdf": ["pdf"], "application/pgp-encrypted": ["pgp"], "application/pgp-signature": ["asc", "sig"], "application/pics-rules": ["prf"], "application/pkcs10": ["p10"], "application/pkcs7-mime": ["p7m", "p7c"], "application/pkcs7-signature": ["p7s"], "application/pkcs8": ["p8"], "application/pkix-attr-cert": ["ac"], "application/pkix-cert": ["cer"], "application/pkix-crl": ["crl"], "application/pkix-pkipath": ["pkipath"], "application/pkixcmp": ["pki"], "application/pls+xml": ["pls"], "application/postscript": ["ai", "eps", "ps"], "application/provenance+xml": ["provx"], "application/pskc+xml": ["pskcxml"], "application/raml+yaml": ["raml"], "application/rdf+xml": ["rdf", "owl"], "application/reginfo+xml": ["rif"], "application/relax-ng-compact-syntax": ["rnc"], "application/resource-lists+xml": ["rl"], "application/resource-lists-diff+xml": ["rld"], "application/rls-services+xml": ["rs"], "application/route-apd+xml": ["rapd"], "application/route-s-tsid+xml": ["sls"], "application/route-usd+xml": ["rusd"], "application/rpki-ghostbusters": ["gbr"], "application/rpki-manifest": ["mft"], "application/rpki-roa": ["roa"], "application/rsd+xml": ["rsd"], "application/rss+xml": ["rss"], "application/rtf": ["rtf"], "application/sbml+xml": ["sbml"], "application/scvp-cv-request": ["scq"], "application/scvp-cv-response": ["scs"], "application/scvp-vp-request": ["spq"], "application/scvp-vp-response": ["spp"], "application/sdp": ["sdp"], "application/senml+xml": ["senmlx"], "application/sensml+xml": ["sensmlx"], "application/set-payment-initiation": ["setpay"], "application/set-registration-initiation": ["setreg"], "application/shf+xml": ["shf"], "application/sieve": ["siv", "sieve"], "application/smil+xml": ["smi", "smil"], "application/sparql-query": ["rq"], "application/sparql-results+xml": ["srx"], "application/srgs": ["gram"], "application/srgs+xml": ["grxml"], "application/sru+xml": ["sru"], "application/ssdl+xml": ["ssdl"], "application/ssml+xml": ["ssml"], "application/swid+xml": ["swidtag"], "application/tei+xml": ["tei", "teicorpus"], "application/thraud+xml": ["tfi"], "application/timestamped-data": ["tsd"], "application/toml": ["toml"], "application/trig": ["trig"], "application/ttml+xml": ["ttml"], "application/ubjson": ["ubj"], "application/urc-ressheet+xml": ["rsheet"], "application/urc-targetdesc+xml": ["td"], "application/voicexml+xml": ["vxml"], "application/wasm": ["wasm"], "application/widget": ["wgt"], "application/winhlp": ["hlp"], "application/wsdl+xml": ["wsdl"], "application/wspolicy+xml": ["wspolicy"], "application/xaml+xml": ["xaml"], "application/xcap-att+xml": ["xav"], "application/xcap-caps+xml": ["xca"], "application/xcap-diff+xml": ["xdf"], "application/xcap-el+xml": ["xel"], "application/xcap-ns+xml": ["xns"], "application/xenc+xml": ["xenc"], "application/xhtml+xml": ["xhtml", "xht"], "application/xliff+xml": ["xlf"], "application/xml": ["xml", "xsl", "xsd", "rng"], "application/xml-dtd": ["dtd"], "application/xop+xml": ["xop"], "application/xproc+xml": ["xpl"], "application/xslt+xml": ["*xsl", "xslt"], "application/xspf+xml": ["xspf"], "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"], "application/yang": ["yang"], "application/yin+xml": ["yin"], "application/zip": ["zip"], "audio/3gpp": ["*3gpp"], "audio/adpcm": ["adp"], "audio/amr": ["amr"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mobile-xmf": ["mxmf"], "audio/mp3": ["*mp3"], "audio/mp4": ["m4a", "mp4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx", "opus"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/wav": ["wav"], "audio/wave": ["*wav"], "audio/webm": ["weba"], "audio/xm": ["xm"], "font/collection": ["ttc"], "font/otf": ["otf"], "font/ttf": ["ttf"], "font/woff": ["woff"], "font/woff2": ["woff2"], "image/aces": ["exr"], "image/apng": ["apng"], "image/avif": ["avif"], "image/bmp": ["bmp"], "image/cgm": ["cgm"], "image/dicom-rle": ["drle"], "image/emf": ["emf"], "image/fits": ["fits"], "image/g3fax": ["g3"], "image/gif": ["gif"], "image/heic": ["heic"], "image/heic-sequence": ["heics"], "image/heif": ["heif"], "image/heif-sequence": ["heifs"], "image/hej2k": ["hej2"], "image/hsj2": ["hsj2"], "image/ief": ["ief"], "image/jls": ["jls"], "image/jp2": ["jp2", "jpg2"], "image/jpeg": ["jpeg", "jpg", "jpe"], "image/jph": ["jph"], "image/jphc": ["jhc"], "image/jpm": ["jpm"], "image/jpx": ["jpx", "jpf"], "image/jxr": ["jxr"], "image/jxra": ["jxra"], "image/jxrs": ["jxrs"], "image/jxs": ["jxs"], "image/jxsc": ["jxsc"], "image/jxsi": ["jxsi"], "image/jxss": ["jxss"], "image/ktx": ["ktx"], "image/ktx2": ["ktx2"], "image/png": ["png"], "image/sgi": ["sgi"], "image/svg+xml": ["svg", "svgz"], "image/t38": ["t38"], "image/tiff": ["tif", "tiff"], "image/tiff-fx": ["tfx"], "image/webp": ["webp"], "image/wmf": ["wmf"], "message/disposition-notification": ["disposition-notification"], "message/global": ["u8msg"], "message/global-delivery-status": ["u8dsn"], "message/global-disposition-notification": ["u8mdn"], "message/global-headers": ["u8hdr"], "message/rfc822": ["eml", "mime"], "model/3mf": ["3mf"], "model/gltf+json": ["gltf"], "model/gltf-binary": ["glb"], "model/iges": ["igs", "iges"], "model/mesh": ["msh", "mesh", "silo"], "model/mtl": ["mtl"], "model/obj": ["obj"], "model/step+xml": ["stpx"], "model/step+zip": ["stpz"], "model/step-xml+zip": ["stpxz"], "model/stl": ["stl"], "model/vrml": ["wrl", "vrml"], "model/x3d+binary": ["*x3db", "x3dbz"], "model/x3d+fastinfoset": ["x3db"], "model/x3d+vrml": ["*x3dv", "x3dvz"], "model/x3d+xml": ["x3d", "x3dz"], "model/x3d-vrml": ["x3dv"], "text/cache-manifest": ["appcache", "manifest"], "text/calendar": ["ics", "ifb"], "text/coffeescript": ["coffee", "litcoffee"], "text/css": ["css"], "text/csv": ["csv"], "text/html": ["html", "htm", "shtml"], "text/jade": ["jade"], "text/jsx": ["jsx"], "text/less": ["less"], "text/markdown": ["markdown", "md"], "text/mathml": ["mml"], "text/mdx": ["mdx"], "text/n3": ["n3"], "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"], "text/richtext": ["rtx"], "text/rtf": ["*rtf"], "text/sgml": ["sgml", "sgm"], "text/shex": ["shex"], "text/slim": ["slim", "slm"], "text/spdx": ["spdx"], "text/stylus": ["stylus", "styl"], "text/tab-separated-values": ["tsv"], "text/troff": ["t", "tr", "roff", "man", "me", "ms"], "text/turtle": ["ttl"], "text/uri-list": ["uri", "uris", "urls"], "text/vcard": ["vcard"], "text/vtt": ["vtt"], "text/xml": ["*xml"], "text/yaml": ["yaml", "yml"], "video/3gpp": ["3gp", "3gpp"], "video/3gpp2": ["3g2"], "video/h261": ["h261"], "video/h263": ["h263"], "video/h264": ["h264"], "video/iso.segment": ["m4s"], "video/jpeg": ["jpgv"], "video/jpm": ["*jpm", "jpgm"], "video/mj2": ["mj2", "mjp2"], "video/mp2t": ["ts"], "video/mp4": ["mp4", "mp4v", "mpg4"], "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"], "video/ogg": ["ogv"], "video/quicktime": ["qt", "mov"], "video/webm": ["webm"] };
var other = { "application/prs.cww": ["cww"], "application/vnd.1000minds.decision-model+xml": ["1km"], "application/vnd.3gpp.pic-bw-large": ["plb"], "application/vnd.3gpp.pic-bw-small": ["psb"], "application/vnd.3gpp.pic-bw-var": ["pvb"], "application/vnd.3gpp2.tcap": ["tcap"], "application/vnd.3m.post-it-notes": ["pwn"], "application/vnd.accpac.simply.aso": ["aso"], "application/vnd.accpac.simply.imp": ["imp"], "application/vnd.acucobol": ["acu"], "application/vnd.acucorp": ["atc", "acutc"], "application/vnd.adobe.air-application-installer-package+zip": ["air"], "application/vnd.adobe.formscentral.fcdt": ["fcdt"], "application/vnd.adobe.fxp": ["fxp", "fxpl"], "application/vnd.adobe.xdp+xml": ["xdp"], "application/vnd.adobe.xfdf": ["xfdf"], "application/vnd.ahead.space": ["ahead"], "application/vnd.airzip.filesecure.azf": ["azf"], "application/vnd.airzip.filesecure.azs": ["azs"], "application/vnd.amazon.ebook": ["azw"], "application/vnd.americandynamics.acc": ["acc"], "application/vnd.amiga.ami": ["ami"], "application/vnd.android.package-archive": ["apk"], "application/vnd.anser-web-certificate-issue-initiation": ["cii"], "application/vnd.anser-web-funds-transfer-initiation": ["fti"], "application/vnd.antix.game-component": ["atx"], "application/vnd.apple.installer+xml": ["mpkg"], "application/vnd.apple.keynote": ["key"], "application/vnd.apple.mpegurl": ["m3u8"], "application/vnd.apple.numbers": ["numbers"], "application/vnd.apple.pages": ["pages"], "application/vnd.apple.pkpass": ["pkpass"], "application/vnd.aristanetworks.swi": ["swi"], "application/vnd.astraea-software.iota": ["iota"], "application/vnd.audiograph": ["aep"], "application/vnd.balsamiq.bmml+xml": ["bmml"], "application/vnd.blueice.multipass": ["mpm"], "application/vnd.bmi": ["bmi"], "application/vnd.businessobjects": ["rep"], "application/vnd.chemdraw+xml": ["cdxml"], "application/vnd.chipnuts.karaoke-mmd": ["mmd"], "application/vnd.cinderella": ["cdy"], "application/vnd.citationstyles.style+xml": ["csl"], "application/vnd.claymore": ["cla"], "application/vnd.cloanto.rp9": ["rp9"], "application/vnd.clonk.c4group": ["c4g", "c4d", "c4f", "c4p", "c4u"], "application/vnd.cluetrust.cartomobile-config": ["c11amc"], "application/vnd.cluetrust.cartomobile-config-pkg": ["c11amz"], "application/vnd.commonspace": ["csp"], "application/vnd.contact.cmsg": ["cdbcmsg"], "application/vnd.cosmocaller": ["cmc"], "application/vnd.crick.clicker": ["clkx"], "application/vnd.crick.clicker.keyboard": ["clkk"], "application/vnd.crick.clicker.palette": ["clkp"], "application/vnd.crick.clicker.template": ["clkt"], "application/vnd.crick.clicker.wordbank": ["clkw"], "application/vnd.criticaltools.wbs+xml": ["wbs"], "application/vnd.ctc-posml": ["pml"], "application/vnd.cups-ppd": ["ppd"], "application/vnd.curl.car": ["car"], "application/vnd.curl.pcurl": ["pcurl"], "application/vnd.dart": ["dart"], "application/vnd.data-vision.rdz": ["rdz"], "application/vnd.dbf": ["dbf"], "application/vnd.dece.data": ["uvf", "uvvf", "uvd", "uvvd"], "application/vnd.dece.ttml+xml": ["uvt", "uvvt"], "application/vnd.dece.unspecified": ["uvx", "uvvx"], "application/vnd.dece.zip": ["uvz", "uvvz"], "application/vnd.denovo.fcselayout-link": ["fe_launch"], "application/vnd.dna": ["dna"], "application/vnd.dolby.mlp": ["mlp"], "application/vnd.dpgraph": ["dpg"], "application/vnd.dreamfactory": ["dfac"], "application/vnd.ds-keypoint": ["kpxx"], "application/vnd.dvb.ait": ["ait"], "application/vnd.dvb.service": ["svc"], "application/vnd.dynageo": ["geo"], "application/vnd.ecowin.chart": ["mag"], "application/vnd.enliven": ["nml"], "application/vnd.epson.esf": ["esf"], "application/vnd.epson.msf": ["msf"], "application/vnd.epson.quickanime": ["qam"], "application/vnd.epson.salt": ["slt"], "application/vnd.epson.ssf": ["ssf"], "application/vnd.eszigno3+xml": ["es3", "et3"], "application/vnd.ezpix-album": ["ez2"], "application/vnd.ezpix-package": ["ez3"], "application/vnd.fdf": ["fdf"], "application/vnd.fdsn.mseed": ["mseed"], "application/vnd.fdsn.seed": ["seed", "dataless"], "application/vnd.flographit": ["gph"], "application/vnd.fluxtime.clip": ["ftc"], "application/vnd.framemaker": ["fm", "frame", "maker", "book"], "application/vnd.frogans.fnc": ["fnc"], "application/vnd.frogans.ltf": ["ltf"], "application/vnd.fsc.weblaunch": ["fsc"], "application/vnd.fujitsu.oasys": ["oas"], "application/vnd.fujitsu.oasys2": ["oa2"], "application/vnd.fujitsu.oasys3": ["oa3"], "application/vnd.fujitsu.oasysgp": ["fg5"], "application/vnd.fujitsu.oasysprs": ["bh2"], "application/vnd.fujixerox.ddd": ["ddd"], "application/vnd.fujixerox.docuworks": ["xdw"], "application/vnd.fujixerox.docuworks.binder": ["xbd"], "application/vnd.fuzzysheet": ["fzs"], "application/vnd.genomatix.tuxedo": ["txd"], "application/vnd.geogebra.file": ["ggb"], "application/vnd.geogebra.tool": ["ggt"], "application/vnd.geometry-explorer": ["gex", "gre"], "application/vnd.geonext": ["gxt"], "application/vnd.geoplan": ["g2w"], "application/vnd.geospace": ["g3w"], "application/vnd.gmx": ["gmx"], "application/vnd.google-apps.document": ["gdoc"], "application/vnd.google-apps.presentation": ["gslides"], "application/vnd.google-apps.spreadsheet": ["gsheet"], "application/vnd.google-earth.kml+xml": ["kml"], "application/vnd.google-earth.kmz": ["kmz"], "application/vnd.grafeq": ["gqf", "gqs"], "application/vnd.groove-account": ["gac"], "application/vnd.groove-help": ["ghf"], "application/vnd.groove-identity-message": ["gim"], "application/vnd.groove-injector": ["grv"], "application/vnd.groove-tool-message": ["gtm"], "application/vnd.groove-tool-template": ["tpl"], "application/vnd.groove-vcard": ["vcg"], "application/vnd.hal+xml": ["hal"], "application/vnd.handheld-entertainment+xml": ["zmm"], "application/vnd.hbci": ["hbci"], "application/vnd.hhe.lesson-player": ["les"], "application/vnd.hp-hpgl": ["hpgl"], "application/vnd.hp-hpid": ["hpid"], "application/vnd.hp-hps": ["hps"], "application/vnd.hp-jlyt": ["jlt"], "application/vnd.hp-pcl": ["pcl"], "application/vnd.hp-pclxl": ["pclxl"], "application/vnd.hydrostatix.sof-data": ["sfd-hdstx"], "application/vnd.ibm.minipay": ["mpy"], "application/vnd.ibm.modcap": ["afp", "listafp", "list3820"], "application/vnd.ibm.rights-management": ["irm"], "application/vnd.ibm.secure-container": ["sc"], "application/vnd.iccprofile": ["icc", "icm"], "application/vnd.igloader": ["igl"], "application/vnd.immervision-ivp": ["ivp"], "application/vnd.immervision-ivu": ["ivu"], "application/vnd.insors.igm": ["igm"], "application/vnd.intercon.formnet": ["xpw", "xpx"], "application/vnd.intergeo": ["i2g"], "application/vnd.intu.qbo": ["qbo"], "application/vnd.intu.qfx": ["qfx"], "application/vnd.ipunplugged.rcprofile": ["rcprofile"], "application/vnd.irepository.package+xml": ["irp"], "application/vnd.is-xpr": ["xpr"], "application/vnd.isac.fcs": ["fcs"], "application/vnd.jam": ["jam"], "application/vnd.jcp.javame.midlet-rms": ["rms"], "application/vnd.jisp": ["jisp"], "application/vnd.joost.joda-archive": ["joda"], "application/vnd.kahootz": ["ktz", "ktr"], "application/vnd.kde.karbon": ["karbon"], "application/vnd.kde.kchart": ["chrt"], "application/vnd.kde.kformula": ["kfo"], "application/vnd.kde.kivio": ["flw"], "application/vnd.kde.kontour": ["kon"], "application/vnd.kde.kpresenter": ["kpr", "kpt"], "application/vnd.kde.kspread": ["ksp"], "application/vnd.kde.kword": ["kwd", "kwt"], "application/vnd.kenameaapp": ["htke"], "application/vnd.kidspiration": ["kia"], "application/vnd.kinar": ["kne", "knp"], "application/vnd.koan": ["skp", "skd", "skt", "skm"], "application/vnd.kodak-descriptor": ["sse"], "application/vnd.las.las+xml": ["lasxml"], "application/vnd.llamagraphics.life-balance.desktop": ["lbd"], "application/vnd.llamagraphics.life-balance.exchange+xml": ["lbe"], "application/vnd.lotus-1-2-3": ["123"], "application/vnd.lotus-approach": ["apr"], "application/vnd.lotus-freelance": ["pre"], "application/vnd.lotus-notes": ["nsf"], "application/vnd.lotus-organizer": ["org"], "application/vnd.lotus-screencam": ["scm"], "application/vnd.lotus-wordpro": ["lwp"], "application/vnd.macports.portpkg": ["portpkg"], "application/vnd.mapbox-vector-tile": ["mvt"], "application/vnd.mcd": ["mcd"], "application/vnd.medcalcdata": ["mc1"], "application/vnd.mediastation.cdkey": ["cdkey"], "application/vnd.mfer": ["mwf"], "application/vnd.mfmp": ["mfm"], "application/vnd.micrografx.flo": ["flo"], "application/vnd.micrografx.igx": ["igx"], "application/vnd.mif": ["mif"], "application/vnd.mobius.daf": ["daf"], "application/vnd.mobius.dis": ["dis"], "application/vnd.mobius.mbk": ["mbk"], "application/vnd.mobius.mqy": ["mqy"], "application/vnd.mobius.msl": ["msl"], "application/vnd.mobius.plc": ["plc"], "application/vnd.mobius.txf": ["txf"], "application/vnd.mophun.application": ["mpn"], "application/vnd.mophun.certificate": ["mpc"], "application/vnd.mozilla.xul+xml": ["xul"], "application/vnd.ms-artgalry": ["cil"], "application/vnd.ms-cab-compressed": ["cab"], "application/vnd.ms-excel": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"], "application/vnd.ms-excel.addin.macroenabled.12": ["xlam"], "application/vnd.ms-excel.sheet.binary.macroenabled.12": ["xlsb"], "application/vnd.ms-excel.sheet.macroenabled.12": ["xlsm"], "application/vnd.ms-excel.template.macroenabled.12": ["xltm"], "application/vnd.ms-fontobject": ["eot"], "application/vnd.ms-htmlhelp": ["chm"], "application/vnd.ms-ims": ["ims"], "application/vnd.ms-lrm": ["lrm"], "application/vnd.ms-officetheme": ["thmx"], "application/vnd.ms-outlook": ["msg"], "application/vnd.ms-pki.seccat": ["cat"], "application/vnd.ms-pki.stl": ["*stl"], "application/vnd.ms-powerpoint": ["ppt", "pps", "pot"], "application/vnd.ms-powerpoint.addin.macroenabled.12": ["ppam"], "application/vnd.ms-powerpoint.presentation.macroenabled.12": ["pptm"], "application/vnd.ms-powerpoint.slide.macroenabled.12": ["sldm"], "application/vnd.ms-powerpoint.slideshow.macroenabled.12": ["ppsm"], "application/vnd.ms-powerpoint.template.macroenabled.12": ["potm"], "application/vnd.ms-project": ["mpp", "mpt"], "application/vnd.ms-word.document.macroenabled.12": ["docm"], "application/vnd.ms-word.template.macroenabled.12": ["dotm"], "application/vnd.ms-works": ["wps", "wks", "wcm", "wdb"], "application/vnd.ms-wpl": ["wpl"], "application/vnd.ms-xpsdocument": ["xps"], "application/vnd.mseq": ["mseq"], "application/vnd.musician": ["mus"], "application/vnd.muvee.style": ["msty"], "application/vnd.mynfc": ["taglet"], "application/vnd.neurolanguage.nlu": ["nlu"], "application/vnd.nitf": ["ntf", "nitf"], "application/vnd.noblenet-directory": ["nnd"], "application/vnd.noblenet-sealer": ["nns"], "application/vnd.noblenet-web": ["nnw"], "application/vnd.nokia.n-gage.ac+xml": ["*ac"], "application/vnd.nokia.n-gage.data": ["ngdat"], "application/vnd.nokia.n-gage.symbian.install": ["n-gage"], "application/vnd.nokia.radio-preset": ["rpst"], "application/vnd.nokia.radio-presets": ["rpss"], "application/vnd.novadigm.edm": ["edm"], "application/vnd.novadigm.edx": ["edx"], "application/vnd.novadigm.ext": ["ext"], "application/vnd.oasis.opendocument.chart": ["odc"], "application/vnd.oasis.opendocument.chart-template": ["otc"], "application/vnd.oasis.opendocument.database": ["odb"], "application/vnd.oasis.opendocument.formula": ["odf"], "application/vnd.oasis.opendocument.formula-template": ["odft"], "application/vnd.oasis.opendocument.graphics": ["odg"], "application/vnd.oasis.opendocument.graphics-template": ["otg"], "application/vnd.oasis.opendocument.image": ["odi"], "application/vnd.oasis.opendocument.image-template": ["oti"], "application/vnd.oasis.opendocument.presentation": ["odp"], "application/vnd.oasis.opendocument.presentation-template": ["otp"], "application/vnd.oasis.opendocument.spreadsheet": ["ods"], "application/vnd.oasis.opendocument.spreadsheet-template": ["ots"], "application/vnd.oasis.opendocument.text": ["odt"], "application/vnd.oasis.opendocument.text-master": ["odm"], "application/vnd.oasis.opendocument.text-template": ["ott"], "application/vnd.oasis.opendocument.text-web": ["oth"], "application/vnd.olpc-sugar": ["xo"], "application/vnd.oma.dd2+xml": ["dd2"], "application/vnd.openblox.game+xml": ["obgx"], "application/vnd.openofficeorg.extension": ["oxt"], "application/vnd.openstreetmap.data+xml": ["osm"], "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"], "application/vnd.openxmlformats-officedocument.presentationml.slide": ["sldx"], "application/vnd.openxmlformats-officedocument.presentationml.slideshow": ["ppsx"], "application/vnd.openxmlformats-officedocument.presentationml.template": ["potx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.template": ["xltx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.template": ["dotx"], "application/vnd.osgeo.mapguide.package": ["mgp"], "application/vnd.osgi.dp": ["dp"], "application/vnd.osgi.subsystem": ["esa"], "application/vnd.palm": ["pdb", "pqa", "oprc"], "application/vnd.pawaafile": ["paw"], "application/vnd.pg.format": ["str"], "application/vnd.pg.osasli": ["ei6"], "application/vnd.picsel": ["efif"], "application/vnd.pmi.widget": ["wg"], "application/vnd.pocketlearn": ["plf"], "application/vnd.powerbuilder6": ["pbd"], "application/vnd.previewsystems.box": ["box"], "application/vnd.proteus.magazine": ["mgz"], "application/vnd.publishare-delta-tree": ["qps"], "application/vnd.pvi.ptid1": ["ptid"], "application/vnd.quark.quarkxpress": ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"], "application/vnd.rar": ["rar"], "application/vnd.realvnc.bed": ["bed"], "application/vnd.recordare.musicxml": ["mxl"], "application/vnd.recordare.musicxml+xml": ["musicxml"], "application/vnd.rig.cryptonote": ["cryptonote"], "application/vnd.rim.cod": ["cod"], "application/vnd.rn-realmedia": ["rm"], "application/vnd.rn-realmedia-vbr": ["rmvb"], "application/vnd.route66.link66+xml": ["link66"], "application/vnd.sailingtracker.track": ["st"], "application/vnd.seemail": ["see"], "application/vnd.sema": ["sema"], "application/vnd.semd": ["semd"], "application/vnd.semf": ["semf"], "application/vnd.shana.informed.formdata": ["ifm"], "application/vnd.shana.informed.formtemplate": ["itp"], "application/vnd.shana.informed.interchange": ["iif"], "application/vnd.shana.informed.package": ["ipk"], "application/vnd.simtech-mindmapper": ["twd", "twds"], "application/vnd.smaf": ["mmf"], "application/vnd.smart.teacher": ["teacher"], "application/vnd.software602.filler.form+xml": ["fo"], "application/vnd.solent.sdkm+xml": ["sdkm", "sdkd"], "application/vnd.spotfire.dxp": ["dxp"], "application/vnd.spotfire.sfs": ["sfs"], "application/vnd.stardivision.calc": ["sdc"], "application/vnd.stardivision.draw": ["sda"], "application/vnd.stardivision.impress": ["sdd"], "application/vnd.stardivision.math": ["smf"], "application/vnd.stardivision.writer": ["sdw", "vor"], "application/vnd.stardivision.writer-global": ["sgl"], "application/vnd.stepmania.package": ["smzip"], "application/vnd.stepmania.stepchart": ["sm"], "application/vnd.sun.wadl+xml": ["wadl"], "application/vnd.sun.xml.calc": ["sxc"], "application/vnd.sun.xml.calc.template": ["stc"], "application/vnd.sun.xml.draw": ["sxd"], "application/vnd.sun.xml.draw.template": ["std"], "application/vnd.sun.xml.impress": ["sxi"], "application/vnd.sun.xml.impress.template": ["sti"], "application/vnd.sun.xml.math": ["sxm"], "application/vnd.sun.xml.writer": ["sxw"], "application/vnd.sun.xml.writer.global": ["sxg"], "application/vnd.sun.xml.writer.template": ["stw"], "application/vnd.sus-calendar": ["sus", "susp"], "application/vnd.svd": ["svd"], "application/vnd.symbian.install": ["sis", "sisx"], "application/vnd.syncml+xml": ["xsm"], "application/vnd.syncml.dm+wbxml": ["bdm"], "application/vnd.syncml.dm+xml": ["xdm"], "application/vnd.syncml.dmddf+xml": ["ddf"], "application/vnd.tao.intent-module-archive": ["tao"], "application/vnd.tcpdump.pcap": ["pcap", "cap", "dmp"], "application/vnd.tmobile-livetv": ["tmo"], "application/vnd.trid.tpt": ["tpt"], "application/vnd.triscape.mxs": ["mxs"], "application/vnd.trueapp": ["tra"], "application/vnd.ufdl": ["ufd", "ufdl"], "application/vnd.uiq.theme": ["utz"], "application/vnd.umajin": ["umj"], "application/vnd.unity": ["unityweb"], "application/vnd.uoml+xml": ["uoml"], "application/vnd.vcx": ["vcx"], "application/vnd.visio": ["vsd", "vst", "vss", "vsw"], "application/vnd.visionary": ["vis"], "application/vnd.vsf": ["vsf"], "application/vnd.wap.wbxml": ["wbxml"], "application/vnd.wap.wmlc": ["wmlc"], "application/vnd.wap.wmlscriptc": ["wmlsc"], "application/vnd.webturbo": ["wtb"], "application/vnd.wolfram.player": ["nbp"], "application/vnd.wordperfect": ["wpd"], "application/vnd.wqd": ["wqd"], "application/vnd.wt.stf": ["stf"], "application/vnd.xara": ["xar"], "application/vnd.xfdl": ["xfdl"], "application/vnd.yamaha.hv-dic": ["hvd"], "application/vnd.yamaha.hv-script": ["hvs"], "application/vnd.yamaha.hv-voice": ["hvp"], "application/vnd.yamaha.openscoreformat": ["osf"], "application/vnd.yamaha.openscoreformat.osfpvg+xml": ["osfpvg"], "application/vnd.yamaha.smaf-audio": ["saf"], "application/vnd.yamaha.smaf-phrase": ["spf"], "application/vnd.yellowriver-custom-menu": ["cmp"], "application/vnd.zul": ["zir", "zirz"], "application/vnd.zzazz.deck+xml": ["zaz"], "application/x-7z-compressed": ["7z"], "application/x-abiword": ["abw"], "application/x-ace-compressed": ["ace"], "application/x-apple-diskimage": ["*dmg"], "application/x-arj": ["arj"], "application/x-authorware-bin": ["aab", "x32", "u32", "vox"], "application/x-authorware-map": ["aam"], "application/x-authorware-seg": ["aas"], "application/x-bcpio": ["bcpio"], "application/x-bdoc": ["*bdoc"], "application/x-bittorrent": ["torrent"], "application/x-blorb": ["blb", "blorb"], "application/x-bzip": ["bz"], "application/x-bzip2": ["bz2", "boz"], "application/x-cbr": ["cbr", "cba", "cbt", "cbz", "cb7"], "application/x-cdlink": ["vcd"], "application/x-cfs-compressed": ["cfs"], "application/x-chat": ["chat"], "application/x-chess-pgn": ["pgn"], "application/x-chrome-extension": ["crx"], "application/x-cocoa": ["cco"], "application/x-conference": ["nsc"], "application/x-cpio": ["cpio"], "application/x-csh": ["csh"], "application/x-debian-package": ["*deb", "udeb"], "application/x-dgc-compressed": ["dgc"], "application/x-director": ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"], "application/x-doom": ["wad"], "application/x-dtbncx+xml": ["ncx"], "application/x-dtbook+xml": ["dtb"], "application/x-dtbresource+xml": ["res"], "application/x-dvi": ["dvi"], "application/x-envoy": ["evy"], "application/x-eva": ["eva"], "application/x-font-bdf": ["bdf"], "application/x-font-ghostscript": ["gsf"], "application/x-font-linux-psf": ["psf"], "application/x-font-pcf": ["pcf"], "application/x-font-snf": ["snf"], "application/x-font-type1": ["pfa", "pfb", "pfm", "afm"], "application/x-freearc": ["arc"], "application/x-futuresplash": ["spl"], "application/x-gca-compressed": ["gca"], "application/x-glulx": ["ulx"], "application/x-gnumeric": ["gnumeric"], "application/x-gramps-xml": ["gramps"], "application/x-gtar": ["gtar"], "application/x-hdf": ["hdf"], "application/x-httpd-php": ["php"], "application/x-install-instructions": ["install"], "application/x-iso9660-image": ["*iso"], "application/x-iwork-keynote-sffkey": ["*key"], "application/x-iwork-numbers-sffnumbers": ["*numbers"], "application/x-iwork-pages-sffpages": ["*pages"], "application/x-java-archive-diff": ["jardiff"], "application/x-java-jnlp-file": ["jnlp"], "application/x-keepass2": ["kdbx"], "application/x-latex": ["latex"], "application/x-lua-bytecode": ["luac"], "application/x-lzh-compressed": ["lzh", "lha"], "application/x-makeself": ["run"], "application/x-mie": ["mie"], "application/x-mobipocket-ebook": ["prc", "mobi"], "application/x-ms-application": ["application"], "application/x-ms-shortcut": ["lnk"], "application/x-ms-wmd": ["wmd"], "application/x-ms-wmz": ["wmz"], "application/x-ms-xbap": ["xbap"], "application/x-msaccess": ["mdb"], "application/x-msbinder": ["obd"], "application/x-mscardfile": ["crd"], "application/x-msclip": ["clp"], "application/x-msdos-program": ["*exe"], "application/x-msdownload": ["*exe", "*dll", "com", "bat", "*msi"], "application/x-msmediaview": ["mvb", "m13", "m14"], "application/x-msmetafile": ["*wmf", "*wmz", "*emf", "emz"], "application/x-msmoney": ["mny"], "application/x-mspublisher": ["pub"], "application/x-msschedule": ["scd"], "application/x-msterminal": ["trm"], "application/x-mswrite": ["wri"], "application/x-netcdf": ["nc", "cdf"], "application/x-ns-proxy-autoconfig": ["pac"], "application/x-nzb": ["nzb"], "application/x-perl": ["pl", "pm"], "application/x-pilot": ["*prc", "*pdb"], "application/x-pkcs12": ["p12", "pfx"], "application/x-pkcs7-certificates": ["p7b", "spc"], "application/x-pkcs7-certreqresp": ["p7r"], "application/x-rar-compressed": ["*rar"], "application/x-redhat-package-manager": ["rpm"], "application/x-research-info-systems": ["ris"], "application/x-sea": ["sea"], "application/x-sh": ["sh"], "application/x-shar": ["shar"], "application/x-shockwave-flash": ["swf"], "application/x-silverlight-app": ["xap"], "application/x-sql": ["sql"], "application/x-stuffit": ["sit"], "application/x-stuffitx": ["sitx"], "application/x-subrip": ["srt"], "application/x-sv4cpio": ["sv4cpio"], "application/x-sv4crc": ["sv4crc"], "application/x-t3vm-image": ["t3"], "application/x-tads": ["gam"], "application/x-tar": ["tar"], "application/x-tcl": ["tcl", "tk"], "application/x-tex": ["tex"], "application/x-tex-tfm": ["tfm"], "application/x-texinfo": ["texinfo", "texi"], "application/x-tgif": ["*obj"], "application/x-ustar": ["ustar"], "application/x-virtualbox-hdd": ["hdd"], "application/x-virtualbox-ova": ["ova"], "application/x-virtualbox-ovf": ["ovf"], "application/x-virtualbox-vbox": ["vbox"], "application/x-virtualbox-vbox-extpack": ["vbox-extpack"], "application/x-virtualbox-vdi": ["vdi"], "application/x-virtualbox-vhd": ["vhd"], "application/x-virtualbox-vmdk": ["vmdk"], "application/x-wais-source": ["src"], "application/x-web-app-manifest+json": ["webapp"], "application/x-x509-ca-cert": ["der", "crt", "pem"], "application/x-xfig": ["fig"], "application/x-xliff+xml": ["*xlf"], "application/x-xpinstall": ["xpi"], "application/x-xz": ["xz"], "application/x-zmachine": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"], "audio/vnd.dece.audio": ["uva", "uvva"], "audio/vnd.digital-winds": ["eol"], "audio/vnd.dra": ["dra"], "audio/vnd.dts": ["dts"], "audio/vnd.dts.hd": ["dtshd"], "audio/vnd.lucent.voice": ["lvp"], "audio/vnd.ms-playready.media.pya": ["pya"], "audio/vnd.nuera.ecelp4800": ["ecelp4800"], "audio/vnd.nuera.ecelp7470": ["ecelp7470"], "audio/vnd.nuera.ecelp9600": ["ecelp9600"], "audio/vnd.rip": ["rip"], "audio/x-aac": ["aac"], "audio/x-aiff": ["aif", "aiff", "aifc"], "audio/x-caf": ["caf"], "audio/x-flac": ["flac"], "audio/x-m4a": ["*m4a"], "audio/x-matroska": ["mka"], "audio/x-mpegurl": ["m3u"], "audio/x-ms-wax": ["wax"], "audio/x-ms-wma": ["wma"], "audio/x-pn-realaudio": ["ram", "ra"], "audio/x-pn-realaudio-plugin": ["rmp"], "audio/x-realaudio": ["*ra"], "audio/x-wav": ["*wav"], "chemical/x-cdx": ["cdx"], "chemical/x-cif": ["cif"], "chemical/x-cmdf": ["cmdf"], "chemical/x-cml": ["cml"], "chemical/x-csml": ["csml"], "chemical/x-xyz": ["xyz"], "image/prs.btif": ["btif"], "image/prs.pti": ["pti"], "image/vnd.adobe.photoshop": ["psd"], "image/vnd.airzip.accelerator.azv": ["azv"], "image/vnd.dece.graphic": ["uvi", "uvvi", "uvg", "uvvg"], "image/vnd.djvu": ["djvu", "djv"], "image/vnd.dvb.subtitle": ["*sub"], "image/vnd.dwg": ["dwg"], "image/vnd.dxf": ["dxf"], "image/vnd.fastbidsheet": ["fbs"], "image/vnd.fpx": ["fpx"], "image/vnd.fst": ["fst"], "image/vnd.fujixerox.edmics-mmr": ["mmr"], "image/vnd.fujixerox.edmics-rlc": ["rlc"], "image/vnd.microsoft.icon": ["ico"], "image/vnd.ms-dds": ["dds"], "image/vnd.ms-modi": ["mdi"], "image/vnd.ms-photo": ["wdp"], "image/vnd.net-fpx": ["npx"], "image/vnd.pco.b16": ["b16"], "image/vnd.tencent.tap": ["tap"], "image/vnd.valve.source.texture": ["vtf"], "image/vnd.wap.wbmp": ["wbmp"], "image/vnd.xiff": ["xif"], "image/vnd.zbrush.pcx": ["pcx"], "image/x-3ds": ["3ds"], "image/x-cmu-raster": ["ras"], "image/x-cmx": ["cmx"], "image/x-freehand": ["fh", "fhc", "fh4", "fh5", "fh7"], "image/x-icon": ["*ico"], "image/x-jng": ["jng"], "image/x-mrsid-image": ["sid"], "image/x-ms-bmp": ["*bmp"], "image/x-pcx": ["*pcx"], "image/x-pict": ["pic", "pct"], "image/x-portable-anymap": ["pnm"], "image/x-portable-bitmap": ["pbm"], "image/x-portable-graymap": ["pgm"], "image/x-portable-pixmap": ["ppm"], "image/x-rgb": ["rgb"], "image/x-tga": ["tga"], "image/x-xbitmap": ["xbm"], "image/x-xpixmap": ["xpm"], "image/x-xwindowdump": ["xwd"], "message/vnd.wfa.wsc": ["wsc"], "model/vnd.collada+xml": ["dae"], "model/vnd.dwf": ["dwf"], "model/vnd.gdl": ["gdl"], "model/vnd.gtw": ["gtw"], "model/vnd.mts": ["mts"], "model/vnd.opengex": ["ogex"], "model/vnd.parasolid.transmit.binary": ["x_b"], "model/vnd.parasolid.transmit.text": ["x_t"], "model/vnd.sap.vds": ["vds"], "model/vnd.usdz+zip": ["usdz"], "model/vnd.valve.source.compiled-map": ["bsp"], "model/vnd.vtu": ["vtu"], "text/prs.lines.tag": ["dsc"], "text/vnd.curl": ["curl"], "text/vnd.curl.dcurl": ["dcurl"], "text/vnd.curl.mcurl": ["mcurl"], "text/vnd.curl.scurl": ["scurl"], "text/vnd.dvb.subtitle": ["sub"], "text/vnd.fly": ["fly"], "text/vnd.fmi.flexstor": ["flx"], "text/vnd.graphviz": ["gv"], "text/vnd.in3d.3dml": ["3dml"], "text/vnd.in3d.spot": ["spot"], "text/vnd.sun.j2me.app-descriptor": ["jad"], "text/vnd.wap.wml": ["wml"], "text/vnd.wap.wmlscript": ["wmls"], "text/x-asm": ["s", "asm"], "text/x-c": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"], "text/x-component": ["htc"], "text/x-fortran": ["f", "for", "f77", "f90"], "text/x-handlebars-template": ["hbs"], "text/x-java-source": ["java"], "text/x-lua": ["lua"], "text/x-markdown": ["mkd"], "text/x-nfo": ["nfo"], "text/x-opml": ["opml"], "text/x-org": ["*org"], "text/x-pascal": ["p", "pas"], "text/x-processing": ["pde"], "text/x-sass": ["sass"], "text/x-scss": ["scss"], "text/x-setext": ["etx"], "text/x-sfv": ["sfv"], "text/x-suse-ymp": ["ymp"], "text/x-uuencode": ["uu"], "text/x-vcalendar": ["vcs"], "text/x-vcard": ["vcf"], "video/vnd.dece.hd": ["uvh", "uvvh"], "video/vnd.dece.mobile": ["uvm", "uvvm"], "video/vnd.dece.pd": ["uvp", "uvvp"], "video/vnd.dece.sd": ["uvs", "uvvs"], "video/vnd.dece.video": ["uvv", "uvvv"], "video/vnd.dvb.file": ["dvb"], "video/vnd.fvt": ["fvt"], "video/vnd.mpegurl": ["mxu", "m4u"], "video/vnd.ms-playready.media.pyv": ["pyv"], "video/vnd.uvvu.mp4": ["uvu", "uvvu"], "video/vnd.vivo": ["viv"], "video/x-f4v": ["f4v"], "video/x-fli": ["fli"], "video/x-flv": ["flv"], "video/x-m4v": ["m4v"], "video/x-matroska": ["mkv", "mk3d", "mks"], "video/x-mng": ["mng"], "video/x-ms-asf": ["asf", "asx"], "video/x-ms-vob": ["vob"], "video/x-ms-wm": ["wm"], "video/x-ms-wmv": ["wmv"], "video/x-ms-wmx": ["wmx"], "video/x-ms-wvx": ["wvx"], "video/x-msvideo": ["avi"], "video/x-sgi-movie": ["movie"], "video/x-smv": ["smv"], "x-conference/x-cooltalk": ["ice"] };
let Mime = Mime_1;
var mime = new Mime(standard, other);
var types = {};
Object.defineProperty(types, "__esModule", { value: true });
types.InternalError = types.NotFoundError = types.MethodNotAllowedError = types.KVError = void 0;
class KVError extends Error {
  constructor(message, status = 500) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = KVError.name;
    this.status = status;
  }
}
types.KVError = KVError;
class MethodNotAllowedError extends KVError {
  constructor(message = `Not a valid request method`, status = 405) {
    super(message, status);
  }
}
types.MethodNotAllowedError = MethodNotAllowedError;
class NotFoundError extends KVError {
  constructor(message = `Not Found`, status = 404) {
    super(message, status);
  }
}
types.NotFoundError = NotFoundError;
class InternalError extends KVError {
  constructor(message = `Internal Error in KV Asset Handler`, status = 500) {
    super(message, status);
  }
}
types.InternalError = InternalError;
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.InternalError = exports.NotFoundError = exports.MethodNotAllowedError = exports.serveSinglePageApp = exports.mapRequestToAsset = exports.getAssetFromKV = void 0;
  const mime$1 = mime;
  const types_1 = types;
  Object.defineProperty(exports, "MethodNotAllowedError", { enumerable: true, get: function() {
    return types_1.MethodNotAllowedError;
  } });
  Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function() {
    return types_1.NotFoundError;
  } });
  Object.defineProperty(exports, "InternalError", { enumerable: true, get: function() {
    return types_1.InternalError;
  } });
  const defaultCacheControl = {
    browserTTL: null,
    edgeTTL: 2 * 60 * 60 * 24,
    bypassCache: false
  };
  const parseStringAsObject = (maybeString) => typeof maybeString === "string" ? JSON.parse(maybeString) : maybeString;
  const getAssetFromKVDefaultOptions = {
    ASSET_NAMESPACE: typeof __STATIC_CONTENT !== "undefined" ? __STATIC_CONTENT : void 0,
    ASSET_MANIFEST: typeof __STATIC_CONTENT_MANIFEST !== "undefined" ? parseStringAsObject(__STATIC_CONTENT_MANIFEST) : {},
    cacheControl: defaultCacheControl,
    defaultMimeType: "text/plain",
    defaultDocument: "index.html",
    pathIsEncoded: false
  };
  function assignOptions(options) {
    return Object.assign({}, getAssetFromKVDefaultOptions, options);
  }
  const mapRequestToAsset = (request, options) => {
    options = assignOptions(options);
    const parsedUrl = new URL(request.url);
    let pathname = parsedUrl.pathname;
    if (pathname.endsWith("/")) {
      pathname = pathname.concat(options.defaultDocument);
    } else if (!mime$1.getType(pathname)) {
      pathname = pathname.concat("/" + options.defaultDocument);
    }
    parsedUrl.pathname = pathname;
    return new Request(parsedUrl.toString(), request);
  };
  exports.mapRequestToAsset = mapRequestToAsset;
  function serveSinglePageApp(request, options) {
    options = assignOptions(options);
    request = mapRequestToAsset(request, options);
    const parsedUrl = new URL(request.url);
    if (parsedUrl.pathname.endsWith(".html")) {
      return new Request(`${parsedUrl.origin}/${options.defaultDocument}`, request);
    } else {
      return request;
    }
  }
  exports.serveSinglePageApp = serveSinglePageApp;
  const getAssetFromKV = async (event, options) => {
    options = assignOptions(options);
    const request = event.request;
    const ASSET_NAMESPACE = options.ASSET_NAMESPACE;
    const ASSET_MANIFEST = parseStringAsObject(options.ASSET_MANIFEST);
    if (typeof ASSET_NAMESPACE === "undefined") {
      throw new types_1.InternalError(`there is no KV namespace bound to the script`);
    }
    const rawPathKey = new URL(request.url).pathname.replace(/^\/+/, "");
    let pathIsEncoded = options.pathIsEncoded;
    let requestKey;
    if (options.mapRequestToAsset) {
      requestKey = options.mapRequestToAsset(request);
    } else if (ASSET_MANIFEST[rawPathKey]) {
      requestKey = request;
    } else if (ASSET_MANIFEST[decodeURIComponent(rawPathKey)]) {
      pathIsEncoded = true;
      requestKey = request;
    } else {
      const mappedRequest = mapRequestToAsset(request);
      const mappedRawPathKey = new URL(mappedRequest.url).pathname.replace(/^\/+/, "");
      if (ASSET_MANIFEST[decodeURIComponent(mappedRawPathKey)]) {
        pathIsEncoded = true;
        requestKey = mappedRequest;
      } else {
        requestKey = mapRequestToAsset(request, options);
      }
    }
    const SUPPORTED_METHODS = ["GET", "HEAD"];
    if (!SUPPORTED_METHODS.includes(requestKey.method)) {
      throw new types_1.MethodNotAllowedError(`${requestKey.method} is not a valid request method`);
    }
    const parsedUrl = new URL(requestKey.url);
    const pathname = pathIsEncoded ? decodeURIComponent(parsedUrl.pathname) : parsedUrl.pathname;
    let pathKey = pathname.replace(/^\/+/, "");
    const cache = caches.default;
    let mimeType = mime$1.getType(pathKey) || options.defaultMimeType;
    if (mimeType.startsWith("text") || mimeType === "application/javascript") {
      mimeType += "; charset=utf-8";
    }
    let shouldEdgeCache = false;
    if (typeof ASSET_MANIFEST !== "undefined") {
      if (ASSET_MANIFEST[pathKey]) {
        pathKey = ASSET_MANIFEST[pathKey];
        shouldEdgeCache = true;
      }
    }
    let cacheKey = new Request(`${parsedUrl.origin}/${pathKey}`, request);
    const evalCacheOpts = (() => {
      switch (typeof options.cacheControl) {
        case "function":
          return options.cacheControl(request);
        case "object":
          return options.cacheControl;
        default:
          return defaultCacheControl;
      }
    })();
    const formatETag = (entityId = pathKey, validatorType = "strong") => {
      if (!entityId) {
        return "";
      }
      switch (validatorType) {
        case "weak":
          if (!entityId.startsWith("W/")) {
            return `W/${entityId}`;
          }
          return entityId;
        case "strong":
          if (entityId.startsWith(`W/"`)) {
            entityId = entityId.replace("W/", "");
          }
          if (!entityId.endsWith(`"`)) {
            entityId = `"${entityId}"`;
          }
          return entityId;
        default:
          return "";
      }
    };
    options.cacheControl = Object.assign({}, defaultCacheControl, evalCacheOpts);
    if (options.cacheControl.bypassCache || options.cacheControl.edgeTTL === null || request.method == "HEAD") {
      shouldEdgeCache = false;
    }
    const shouldSetBrowserCache = typeof options.cacheControl.browserTTL === "number";
    let response = null;
    if (shouldEdgeCache) {
      response = await cache.match(cacheKey);
    }
    if (response) {
      if (response.status > 300 && response.status < 400) {
        if (response.body && "cancel" in Object.getPrototypeOf(response.body)) {
          response.body.cancel();
        }
        response = new Response(null, response);
      } else {
        let opts = {
          headers: new Headers(response.headers),
          status: 0,
          statusText: ""
        };
        opts.headers.set("cf-cache-status", "HIT");
        if (response.status) {
          opts.status = response.status;
          opts.statusText = response.statusText;
        } else if (opts.headers.has("Content-Range")) {
          opts.status = 206;
          opts.statusText = "Partial Content";
        } else {
          opts.status = 200;
          opts.statusText = "OK";
        }
        response = new Response(response.body, opts);
      }
    } else {
      const body = await ASSET_NAMESPACE.get(pathKey, "arrayBuffer");
      if (body === null) {
        throw new types_1.NotFoundError(`could not find ${pathKey} in your content namespace`);
      }
      response = new Response(body);
      if (shouldEdgeCache) {
        response.headers.set("Accept-Ranges", "bytes");
        response.headers.set("Content-Length", body.length);
        if (!response.headers.has("etag")) {
          response.headers.set("etag", formatETag(pathKey, "strong"));
        }
        response.headers.set("Cache-Control", `max-age=${options.cacheControl.edgeTTL}`);
        event.waitUntil(cache.put(cacheKey, response.clone()));
        response.headers.set("CF-Cache-Status", "MISS");
      }
    }
    response.headers.set("Content-Type", mimeType);
    if (response.status === 304) {
      let etag = formatETag(response.headers.get("etag"), "strong");
      let ifNoneMatch = cacheKey.headers.get("if-none-match");
      let proxyCacheStatus = response.headers.get("CF-Cache-Status");
      if (etag) {
        if (ifNoneMatch && ifNoneMatch === etag && proxyCacheStatus === "MISS") {
          response.headers.set("CF-Cache-Status", "EXPIRED");
        } else {
          response.headers.set("CF-Cache-Status", "REVALIDATED");
        }
        response.headers.set("etag", formatETag(etag, "weak"));
      }
    }
    if (shouldSetBrowserCache) {
      response.headers.set("Cache-Control", `max-age=${options.cacheControl.browserTTL}`);
    } else {
      response.headers.delete("Cache-Control");
    }
    return response;
  };
  exports.getAssetFromKV = getAssetFromKV;
})(dist);
async function d(a) {
  const b2 = a.request, c2 = new URL(b2.url);
  return /\.\w+$/.test(c2.pathname) ? f(a, c2) : e(a, b2);
}
async function e(e2, b2) {
  await caches.open("custom:qwik");
  const c2 = await render({ url: new URL(b2.url), base: "/build/" }), d2 = new Response(c2.html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "max-age=60" } });
  return d2;
}
async function f(a, c2) {
  try {
    const d2 = void 0, e2 = await dist.getAssetFromKV(a, d2);
    return e2;
  } catch (f2) {
    return new Response(`"${c2.pathname}" not found`, { status: 404, statusText: "not found" });
  }
}
addEventListener("fetch", (a) => {
  a.respondWith(d(a));
});
const Nav_render = () => /* @__PURE__ */ jsx("header", { class: "header", children: /* @__PURE__ */ jsx("nav", { class: "inner", children: [/* @__PURE__ */ jsx("a", { href: "/", children: /* @__PURE__ */ jsx("strong", { children: "HN" }) }), /* @__PURE__ */ jsx("a", { href: "/?type=new", children: /* @__PURE__ */ jsx("strong", { children: "New" }) }), /* @__PURE__ */ jsx("a", { href: "/?type=show", children: /* @__PURE__ */ jsx("strong", { children: "Show" }) }), /* @__PURE__ */ jsx("a", { href: "/?type=ask", children: /* @__PURE__ */ jsx("strong", { children: "Ask" }) }), /* @__PURE__ */ jsx("a", { href: "/?type=job", children: /* @__PURE__ */ jsx("strong", { children: "Jobs" }) }), /* @__PURE__ */ jsx("a", { class: "github", href: "http://github.com/builderio/qwikdev", target: "_blank", rel: "noreferrer", children: "Built with Qwik" })] }) });
var entry_Nav = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Nav_render
}, Symbol.toStringTag, { value: "Module" }));
const StoryPreview_render = (d2) => /* @__PURE__ */ jsx("li", { class: "news-item", children: [/* @__PURE__ */ jsx("span", { class: "score", children: d2.story.points }), /* @__PURE__ */ jsx("span", { class: "title", children: d2.story.url && !d2.story.url.startsWith("item?id=") ? /* @__PURE__ */ jsx(Fragment, { children: [/* @__PURE__ */ jsx("a", { href: d2.story.url, target: "_blank", rel: "noreferrer", children: d2.story.title }), /* @__PURE__ */ jsx("span", { class: "host", children: [" (", d2.story.domain, ")"] })] }) : /* @__PURE__ */ jsx("a", { href: `/item/${d2.story.id}`, children: d2.story.title }) }), /* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("span", { class: "meta", children: "job" !== d2.story.type ? /* @__PURE__ */ jsx(Fragment, { children: ["by ", /* @__PURE__ */ jsx("a", { href: `/users/${d2.story.user}`, children: d2.story.user }), " ", d2.story.time_ago, " |", " ", /* @__PURE__ */ jsx("a", { href: `/stories/${d2.story.id}`, children: d2.story.comments_count ? `${d2.story.comments_count} comments` : "discuss" })] }) : /* @__PURE__ */ jsx("a", { href: `/stories/${d2.story.id}`, children: d2.story.time_ago }) }), "link" !== d2.story.type && /* @__PURE__ */ jsx(Fragment, { children: [" ", /* @__PURE__ */ jsx("span", { class: "label", children: d2.story.type })] })] });
var entry_StoryPreview = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  StoryPreview_render
}, Symbol.toStringTag, { value: "Module" }));
const Toggle_onRender_a_onClick = () => {
  const [b2] = useLexicalScope();
  return b2.open = !b2.open;
};
const Toggle_render = () => {
  const g2 = useStore({ open: true });
  return /* @__PURE__ */ jsx(Fragment, { children: [/* @__PURE__ */ jsx("div", { class: g2.open ? "toggle open" : "toggle", children: /* @__PURE__ */ jsx("a", { onClickQrl: qrl(() => Promise.resolve().then(function() {
    return entry_Toggle;
  }), "Toggle_onRender_a_onClick", [g2]), children: g2.open ? "[-]" : "[+] collapsed" }) }), g2.open && /* @__PURE__ */ jsx("ul", { class: "comment-children", children: /* @__PURE__ */ jsx(Slot, {}) })] });
};
var entry_Toggle = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Toggle_onRender_a_onClick,
  Toggle_render
}, Symbol.toStringTag, { value: "Module" }));
const Comment_render = (c2) => /* @__PURE__ */ jsx("li", { class: "comment", children: [/* @__PURE__ */ jsx("div", { class: "by", children: [/* @__PURE__ */ jsx("a", { href: `/users/${c2.comment.user}`, children: c2.comment.user }), " ", c2.comment.time_ago] }), /* @__PURE__ */ jsx("div", { class: "text", innerHTML: c2.comment.content }), !!c2.comment.comments.length && /* @__PURE__ */ jsx(Toggle, { children: c2.comment.comments.map((b2) => /* @__PURE__ */ jsx(Comment, { comment: b2 })) })] });
var entry_Comment = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Comment_render
}, Symbol.toStringTag, { value: "Module" }));
const Stories_render = (g2) => {
  const { stories: c2, page: e2, type: f2 } = g2.data;
  return /* @__PURE__ */ jsx("div", { class: "news-view", children: [/* @__PURE__ */ jsx("div", { class: "news-list-nav", children: [e2 > 1 ? /* @__PURE__ */ jsx("a", { class: "page-link", href: `/?type=${f2}&page=${e2 - 1}`, "aria-label": "Previous Page", children: ["<", " prev"] }) : /* @__PURE__ */ jsx("span", { class: "page-link disabled", "aria-disabled": "true", children: ["<", " prev"] }), /* @__PURE__ */ jsx("span", { children: ["page ", e2] }), c2 && c2.length >= 29 ? /* @__PURE__ */ jsx("a", { class: "page-link", href: `/?type=${f2}&page=${e2 + 1}`, "aria-label": "Next Page", children: ["more ", ">"] }) : /* @__PURE__ */ jsx("span", { class: "page-link disabled", "aria-disabled": "true", children: ["more ", ">"] })] }), /* @__PURE__ */ jsx("main", { class: "news-list", children: c2 && /* @__PURE__ */ jsx("ul", { children: c2.map((b2) => /* @__PURE__ */ jsx(StoryPreview, { story: b2 })) }) })] });
};
var entry_Stories = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Stories_render
}, Symbol.toStringTag, { value: "Module" }));
const Story_render = (d2) => /* @__PURE__ */ jsx(Fragment, { children: d2.data && /* @__PURE__ */ jsx("div", { class: "item-view", children: [/* @__PURE__ */ jsx("div", { class: "item-view-header", children: [/* @__PURE__ */ jsx("a", { href: d2.data.url, target: "_blank", children: /* @__PURE__ */ jsx("h1", { children: d2.data.title }) }), d2.data.domain && /* @__PURE__ */ jsx("span", { class: "host", children: ["(", d2.data.domain, ")"] }), /* @__PURE__ */ jsx("p", { class: "meta", children: [d2.data.points, " points | by", " ", /* @__PURE__ */ jsx("a", { href: `/users/${d2.data.user}`, children: d2.data.user }), " ", d2.data.time_ago, " ago"] })] }), /* @__PURE__ */ jsx("div", { class: "item-view-comments", children: [/* @__PURE__ */ jsx("p", { class: "item-view-comments-header", children: d2.data.comments_count ? d2.data.comments_count + " comments" : "No comments yet." }), /* @__PURE__ */ jsx("ul", { class: "comment-children", children: d2.data.comments.map((b2) => /* @__PURE__ */ jsx(Comment, { comment: b2 })) })] })] }) });
var entry_Story = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Story_render
}, Symbol.toStringTag, { value: "Module" }));
const User_render = (d2) => /* @__PURE__ */ jsx("div", { class: "user-view", children: d2.data && d2.data.error ? /* @__PURE__ */ jsx("h1", { children: "User not found." }) : /* @__PURE__ */ jsx(Fragment, { children: [/* @__PURE__ */ jsx("h1", { children: ["User : ", d2.data.id] }), /* @__PURE__ */ jsx("ul", { class: "meta", children: [/* @__PURE__ */ jsx("li", { children: [/* @__PURE__ */ jsx("span", { class: "label", children: "Created:" }), " ", d2.data.created] }), /* @__PURE__ */ jsx("li", { children: [/* @__PURE__ */ jsx("span", { class: "label", children: "Karma:" }), " ", d2.data.karma] }), d2.data.about && /* @__PURE__ */ jsx("li", { class: "about", innerHTML: d2.data.about })] }), /* @__PURE__ */ jsx("p", { class: "links", children: [/* @__PURE__ */ jsx("a", { href: `https://news.ycombinator.com/submitted?id=${d2.data.id}`, children: "submissions" }), " ", "|", " ", /* @__PURE__ */ jsx("a", { href: `https://news.ycombinator.com/threads?id=${d2.data.id}`, children: "comments" })] })] }) });
var entry_User = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  User_render
}, Symbol.toStringTag, { value: "Module" }));
