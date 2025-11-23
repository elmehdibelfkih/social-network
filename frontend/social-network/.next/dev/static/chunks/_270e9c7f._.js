(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/features/auth/styles.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "activeTab": "styles-module__sxhNQq__activeTab",
  "authCard": "styles-module__sxhNQq__authCard",
  "errorAlert": "styles-module__sxhNQq__errorAlert",
  "fileInput": "styles-module__sxhNQq__fileInput",
  "formContainer": "styles-module__sxhNQq__formContainer",
  "input": "styles-module__sxhNQq__input",
  "inputGroup": "styles-module__sxhNQq__inputGroup",
  "navButtons": "styles-module__sxhNQq__navButtons",
  "row": "styles-module__sxhNQq__row",
  "submitButton": "styles-module__sxhNQq__submitButton",
  "tabButton": "styles-module__sxhNQq__tabButton",
  "textarea": "styles-module__sxhNQq__textarea",
  "title": "styles-module__sxhNQq__title",
  "welcomeMsg": "styles-module__sxhNQq__welcomeMsg",
});
}),
"[project]/libs/apiClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "http",
    ()=>http
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const BASE_URL = ("TURBOPACK compile-time value", "http://localhost:8080");
const isServer = ("TURBOPACK compile-time value", "object") === 'undefined';
const http = {
    get: (url)=>apiClient(url, "GET", undefined),
    post: (url, payload)=>apiClient(url, "POST", payload),
    put: (url, payload)=>apiClient(url, "PUT", payload),
    patch: (url, payload)=>apiClient(url, "PATCH", payload),
    delete: (url)=>apiClient(url, "DELETE", undefined)
};
async function apiClient(endpoint, method, payload) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        "Content-Type": "application/json"
    };
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const response = await fetch(url, {
            method,
            credentials: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'include',
            headers,
            body: payload ? JSON.stringify(payload) : undefined
        });
        const body = await response.json().catch(()=>null);
        if (!response.ok) {
            if (response.status === 401) {
                console.log(body); ////////////////////////
                return undefined;
            }
            const errorMessage = body?.error?.errorMessage || "Something went wrong";
            if ("TURBOPACK compile-time truthy", 1) {
                const { ShowSnackbar } = await __turbopack_context__.A("[project]/components/ui/snackbar.tsx [app-client] (ecmascript, async loader)");
                ShowSnackbar({
                    status: false,
                    message: errorMessage
                });
            }
            return Promise.reject(new Error(errorMessage));
        }
        if (!isServer && method !== 'GET') {
            const { ShowSnackbar } = await __turbopack_context__.A("[project]/components/ui/snackbar.tsx [app-client] (ecmascript, async loader)");
            ShowSnackbar({
                status: true,
                message: "Operation successful"
            });
        }
        return body;
    } catch (error) {
        if ("TURBOPACK compile-time truthy", 1) {
            const { ShowSnackbar } = await __turbopack_context__.A("[project]/components/ui/snackbar.tsx [app-client] (ecmascript, async loader)");
            ShowSnackbar({
                status: false,
                message: "Network Error"
            });
        }
        return Promise.reject(error instanceof Error ? error : new Error("Unknown Error"));
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/auth/services/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authService",
    ()=>authService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$libs$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/libs/apiClient.ts [app-client] (ecmascript)");
;
const authService = {
    async register (data) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$libs$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].post('/api/v1/auth/register', data);
    },
    async login (data) {
        const payload = {
            identifier: data.identifier,
            password: data.password,
            rememberMe: data.rememberMe
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$libs$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].post('/api/v1/auth/login', payload);
    },
    async uploadAvatar (file) {
        if (!file) throw new Error("No file provided");
        const encodedFile = await this.avatarToBase64(file);
        const rawEncodedFile = encodedFile.split(',')[1];
        const payload = {
            fileName: file.name,
            fileType: file.type,
            fileData: rawEncodedFile,
            purpose: "avatar"
        };
        return await __TURBOPACK__imported__module__$5b$project$5d2f$libs$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].post('/api/v1/media/upload', payload);
    },
    async logout () {
        __TURBOPACK__imported__module__$5b$project$5d2f$libs$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].post('/api/v1/auth/logout', {});
    },
    async getSession () {
        return __TURBOPACK__imported__module__$5b$project$5d2f$libs$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/v1/auth/session');
    },
    async getActiveSessions () {
        return __TURBOPACK__imported__module__$5b$project$5d2f$libs$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].get('/api/v1/sessions');
    },
    async deleteSession (sessionId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$libs$2f$apiClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["http"].delete(`/api/v1/sessions/${sessionId}`);
    },
    avatarToBase64 (file) {
        return new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = ()=>resolve(reader.result);
            reader.onerror = (error)=>reject(error);
        });
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/auth/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/services/auth.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/providers/authProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const authContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(6);
    if ($[0] !== "66583d2704fa146af117aa269f5246a2c9db68b55860ed9dd519613bd800ae1f") {
        for(let $i = 0; $i < 6; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "66583d2704fa146af117aa269f5246a2c9db68b55860ed9dd519613bd800ae1f";
    }
    const { children } = t0;
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    let t1;
    if ($[1] !== user) {
        t1 = {
            user,
            setUser
        };
        $[1] = user;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] !== children || $[4] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(authContext.Provider, {
            value: t1,
            children: children
        }, void 0, false, {
            fileName: "[project]/providers/authProvider.tsx",
            lineNumber: 40,
            columnNumber: 10
        }, this);
        $[3] = children;
        $[4] = t1;
        $[5] = t2;
    } else {
        t2 = $[5];
    }
    return t2;
}
_s(AuthProvider, "Iei9RGtZU29Y1RhBe1sbfh/MntA=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "66583d2704fa146af117aa269f5246a2c9db68b55860ed9dd519613bd800ae1f") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "66583d2704fa146af117aa269f5246a2c9db68b55860ed9dd519613bd800ae1f";
    }
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(authContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}
_s1(useAuth, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/auth/login.client.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoginForm",
    ()=>LoginForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/features/auth/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/services/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/features/auth/styles.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$authProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/providers/authProvider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function LoginForm(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(39);
    if ($[0] !== "c6523cff71ca73d848e246d506537a482f349d89ed12eaae1c854ac34446d86e") {
        for(let $i = 0; $i < 39; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "c6523cff71ca73d848e246d506537a482f349d89ed12eaae1c854ac34446d86e";
    }
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            identifier: "",
            password: "",
            rememberMe: false
        };
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    const { setUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$authProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    let t2;
    if ($[2] !== formData || $[3] !== router || $[4] !== setUser) {
        t2 = ({
            "LoginForm[handleSubmit]": async (e)=>{
                e.preventDefault();
                setIsLoading(true);
                ;
                try {
                    const resp = await __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].login(formData);
                    setUser({
                        userId: resp.userId,
                        avatarId: resp.avatarId,
                        nickname: resp.nickname,
                        firstName: resp.firstName,
                        lastName: resp.lastName
                    });
                    router.push("/feed");
                    router.refresh();
                } catch (t3) {
                    const error = t3;
                    setIsLoading(false);
                    console.error("Login failed:", error);
                }
            }
        })["LoginForm[handleSubmit]"];
        $[2] = formData;
        $[3] = router;
        $[4] = setUser;
        $[5] = t2;
    } else {
        t2 = $[5];
    }
    const handleSubmit = t2;
    let t3;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].header,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].title,
                    children: "Log In"
                }, void 0, false, {
                    fileName: "[project]/features/auth/login.client.tsx",
                    lineNumber: 69,
                    columnNumber: 41
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].welcomeMsg,
                    children: "Wacha sahbi, dkhl dkhl rah bdina"
                }, void 0, false, {
                    fileName: "[project]/features/auth/login.client.tsx",
                    lineNumber: 69,
                    columnNumber: 81
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 69,
            columnNumber: 10
        }, this);
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            htmlFor: "identifier",
            children: "Email or Nickname"
        }, void 0, false, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 76,
            columnNumber: 10
        }, this);
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    let t5;
    if ($[8] !== formData) {
        t5 = ({
            "LoginForm[<input>.onChange]": (e_0)=>setFormData({
                    ...formData,
                    identifier: e_0.target.value
                })
        })["LoginForm[<input>.onChange]"];
        $[8] = formData;
        $[9] = t5;
    } else {
        t5 = $[9];
    }
    let t6;
    if ($[10] !== formData.identifier || $[11] !== isLoading || $[12] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
            children: [
                t4,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    id: "identifier",
                    type: "text",
                    placeholder: "Enter your email",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                    value: formData.identifier,
                    onChange: t5,
                    required: true,
                    disabled: isLoading
                }, void 0, false, {
                    fileName: "[project]/features/auth/login.client.tsx",
                    lineNumber: 96,
                    columnNumber: 49
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 96,
            columnNumber: 10
        }, this);
        $[10] = formData.identifier;
        $[11] = isLoading;
        $[12] = t5;
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            htmlFor: "password",
            children: "Password"
        }, void 0, false, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 106,
            columnNumber: 10
        }, this);
        $[14] = t7;
    } else {
        t7 = $[14];
    }
    let t8;
    if ($[15] !== formData) {
        t8 = ({
            "LoginForm[<input>.onChange]": (e_1)=>setFormData({
                    ...formData,
                    password: e_1.target.value
                })
        })["LoginForm[<input>.onChange]"];
        $[15] = formData;
        $[16] = t8;
    } else {
        t8 = $[16];
    }
    let t9;
    if ($[17] !== formData.password || $[18] !== isLoading || $[19] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
            children: [
                t7,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "password",
                    id: "password",
                    placeholder: "Enter your password",
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                    value: formData.password,
                    onChange: t8,
                    required: true,
                    disabled: isLoading
                }, void 0, false, {
                    fileName: "[project]/features/auth/login.client.tsx",
                    lineNumber: 126,
                    columnNumber: 49
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 126,
            columnNumber: 10
        }, this);
        $[17] = formData.password;
        $[18] = isLoading;
        $[19] = t8;
        $[20] = t9;
    } else {
        t9 = $[20];
    }
    let t10;
    if ($[21] !== formData) {
        t10 = ({
            "LoginForm[<input>.onChange]": (e_2)=>setFormData({
                    ...formData,
                    rememberMe: e_2.target.checked
                })
        })["LoginForm[<input>.onChange]"];
        $[21] = formData;
        $[22] = t10;
    } else {
        t10 = $[22];
    }
    let t11;
    if ($[23] !== formData.rememberMe || $[24] !== isLoading || $[25] !== t10) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
            type: "checkbox",
            id: "remember",
            checked: formData.rememberMe,
            onChange: t10,
            disabled: isLoading
        }, void 0, false, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 149,
            columnNumber: 11
        }, this);
        $[23] = formData.rememberMe;
        $[24] = isLoading;
        $[25] = t10;
        $[26] = t11;
    } else {
        t11 = $[26];
    }
    let t12;
    if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            htmlFor: "remember",
            children: "Remember Me"
        }, void 0, false, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 159,
            columnNumber: 11
        }, this);
        $[27] = t12;
    } else {
        t12 = $[27];
    }
    let t13;
    if ($[28] !== t11) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkboxGroup,
            children: [
                t11,
                t12
            ]
        }, void 0, true, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 166,
            columnNumber: 11
        }, this);
        $[28] = t11;
        $[29] = t13;
    } else {
        t13 = $[29];
    }
    const t14 = isLoading ? "Logging In..." : "Log In";
    let t15;
    if ($[30] !== isLoading || $[31] !== t14) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "submit",
            className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].submitButton,
            disabled: isLoading,
            children: t14
        }, void 0, false, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 175,
            columnNumber: 11
        }, this);
        $[30] = isLoading;
        $[31] = t14;
        $[32] = t15;
    } else {
        t15 = $[32];
    }
    let t16;
    if ($[33] !== handleSubmit || $[34] !== t13 || $[35] !== t15 || $[36] !== t6 || $[37] !== t9) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit,
            className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].formContainer,
            children: [
                t3,
                t6,
                t9,
                t13,
                t15
            ]
        }, void 0, true, {
            fileName: "[project]/features/auth/login.client.tsx",
            lineNumber: 184,
            columnNumber: 11
        }, this);
        $[33] = handleSubmit;
        $[34] = t13;
        $[35] = t15;
        $[36] = t6;
        $[37] = t9;
        $[38] = t16;
    } else {
        t16 = $[38];
    }
    return t16;
}
_s(LoginForm, "O01BXvXAl9vsK7n7egfHhF08HQ4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$authProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = LoginForm;
var _c;
__turbopack_context__.k.register(_c, "LoginForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/auth/signup.client.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RegisterForm",
    ()=>RegisterForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/services/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/features/auth/styles.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$authProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/providers/authProvider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function RegisterForm({ onAuthSuccess }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nickname: '',
        aboutMe: '',
        avatarId: 0
    });
    const { setUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$authProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setIsLoading(true);
        try {
            const resp = await __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].register(formData);
            setUser({
                userId: resp.userId,
                avatarId: resp.avatarId,
                nickname: resp.nickname,
                firstName: resp.firstName,
                lastName: resp.lastName
            });
            router.push('/');
        } catch (error) {
            console.error("Failed to register:", error);
        } finally{
            setIsLoading(false);
        }
    };
    const handleUploadAvatar = async (e_0)=>{
        const avatar = e_0.target.files?.[0];
        if (!avatar) return;
        try {
            const avatarResp = await __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].uploadAvatar(avatar);
            const avatarId = avatarResp.mediaId;
            setFormData((prev)=>({
                    ...prev,
                    avatarId
                }));
        } catch (error_0) {
            console.error("Failed to upload avatar:", error_0);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].formContainer,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].header,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].title,
                        children: "Sign Up"
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 63,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].welcomeMsg,
                        children: "Create your account to get started."
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 64,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/auth/signup.client.tsx",
                lineNumber: 62,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].row,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "firstName",
                                children: "First Name *"
                            }, void 0, false, {
                                fileName: "[project]/features/auth/signup.client.tsx",
                                lineNumber: 69,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                id: "firstName",
                                placeholder: "John",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                onChange: (e_1)=>setFormData({
                                        ...formData,
                                        firstName: e_1.target.value
                                    }),
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/features/auth/signup.client.tsx",
                                lineNumber: 70,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 68,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "lastName",
                                children: "Last Name *"
                            }, void 0, false, {
                                fileName: "[project]/features/auth/signup.client.tsx",
                                lineNumber: 76,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                id: "lastName",
                                placeholder: "Doe",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                onChange: (e_2)=>setFormData({
                                        ...formData,
                                        lastName: e_2.target.value
                                    }),
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/features/auth/signup.client.tsx",
                                lineNumber: 77,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 75,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/auth/signup.client.tsx",
                lineNumber: 67,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "signUpEmail",
                        children: "Email *"
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 85,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "email",
                        id: "signUpEmail",
                        placeholder: "john.doe@example.com",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                        onChange: (e_3)=>setFormData({
                                ...formData,
                                email: e_3.target.value
                            }),
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 86,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/auth/signup.client.tsx",
                lineNumber: 84,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "signUpPassword",
                        children: "Password *"
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 93,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "password",
                        id: "signUpPassword",
                        placeholder: "Create a password",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                        onChange: (e_4)=>setFormData({
                                ...formData,
                                password: e_4.target.value
                            }),
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 94,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/auth/signup.client.tsx",
                lineNumber: 92,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "dob",
                        children: "Date of Birth *"
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 101,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "date",
                        id: "dob",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                        required: true,
                        onChange: (e_5)=>setFormData({
                                ...formData,
                                dateOfBirth: e_5.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 102,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/auth/signup.client.tsx",
                lineNumber: 100,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "nickname",
                        children: "Nickname (Optional)"
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 109,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        id: "nickname",
                        placeholder: "@johndoe",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                        onChange: (e_6)=>setFormData({
                                ...formData,
                                nickname: e_6.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 110,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/auth/signup.client.tsx",
                lineNumber: 108,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "aboutMe",
                        children: "About Me (Optional)"
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 117,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        id: "aboutMe",
                        placeholder: "Tell us about yourself",
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input} ${__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].textarea}`,
                        rows: 3,
                        onChange: (e_7)=>setFormData({
                                ...formData,
                                aboutMe: e_7.target.value
                            })
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/auth/signup.client.tsx",
                lineNumber: 116,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "avatar",
                        children: "Avatar (max size: 10 MB)"
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 125,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "file",
                        id: "avatar",
                        accept: "image/*",
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input} ${__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].fileInput}`,
                        onChange: handleUploadAvatar
                    }, void 0, false, {
                        fileName: "[project]/features/auth/signup.client.tsx",
                        lineNumber: 126,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/features/auth/signup.client.tsx",
                lineNumber: 124,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "submit",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].submitButton,
                disabled: isLoading,
                children: isLoading ? 'Creating Account...' : 'Sign Up'
            }, void 0, false, {
                fileName: "[project]/features/auth/signup.client.tsx",
                lineNumber: 129,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/features/auth/signup.client.tsx",
        lineNumber: 61,
        columnNumber: 10
    }, this);
}
_s(RegisterForm, "X/wF0re7uO1YK6X3MrQcFnpWIcY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$authProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = RegisterForm;
var _c;
__turbopack_context__.k.register(_c, "RegisterForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/features/auth/auth.client.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/features/auth/styles.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$login$2e$client$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/login.client.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$signup$2e$client$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/signup.client.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function AuthForm(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(16);
    if ($[0] !== "3d45f2f735d28264b3ce99fd3f57710bcd410ec58751b112d8640c6cde363693") {
        for(let $i = 0; $i < 16; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "3d45f2f735d28264b3ce99fd3f57710bcd410ec58751b112d8640c6cde363693";
    }
    const { onAuthSuccess } = t0;
    const [isLogin, setIsLogin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const t1 = `${__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabButton} ${isLogin ? __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].activeTab : ""}`;
    let t2;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ({
            "AuthForm[<button>.onClick]": ()=>{
                setIsLogin(true);
            }
        })["AuthForm[<button>.onClick]"];
        $[1] = t2;
    } else {
        t2 = $[1];
    }
    let t3;
    if ($[2] !== t1) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: t1,
            onClick: t2,
            children: "Log In"
        }, void 0, false, {
            fileName: "[project]/features/auth/auth.client.tsx",
            lineNumber: 34,
            columnNumber: 10
        }, this);
        $[2] = t1;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    const t4 = `${__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabButton} ${!isLogin ? __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].activeTab : ""}`;
    let t5;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = ({
            "AuthForm[<button>.onClick]": ()=>{
                setIsLogin(false);
            }
        })["AuthForm[<button>.onClick]"];
        $[4] = t5;
    } else {
        t5 = $[4];
    }
    let t6;
    if ($[5] !== t4) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: t4,
            onClick: t5,
            children: "Sign Up"
        }, void 0, false, {
            fileName: "[project]/features/auth/auth.client.tsx",
            lineNumber: 54,
            columnNumber: 10
        }, this);
        $[5] = t4;
        $[6] = t6;
    } else {
        t6 = $[6];
    }
    let t7;
    if ($[7] !== t3 || $[8] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].navButtons,
            children: [
                t3,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/features/auth/auth.client.tsx",
            lineNumber: 62,
            columnNumber: 10
        }, this);
        $[7] = t3;
        $[8] = t6;
        $[9] = t7;
    } else {
        t7 = $[9];
    }
    let t8;
    if ($[10] !== isLogin || $[11] !== onAuthSuccess) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].formContent,
            children: isLogin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$login$2e$client$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoginForm"], {
                onAuthSuccess: onAuthSuccess
            }, void 0, false, {
                fileName: "[project]/features/auth/auth.client.tsx",
                lineNumber: 71,
                columnNumber: 57
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$signup$2e$client$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RegisterForm"], {
                onAuthSuccess: onAuthSuccess
            }, void 0, false, {
                fileName: "[project]/features/auth/auth.client.tsx",
                lineNumber: 71,
                columnNumber: 103
            }, this)
        }, void 0, false, {
            fileName: "[project]/features/auth/auth.client.tsx",
            lineNumber: 71,
            columnNumber: 10
        }, this);
        $[10] = isLogin;
        $[11] = onAuthSuccess;
        $[12] = t8;
    } else {
        t8 = $[12];
    }
    let t9;
    if ($[13] !== t7 || $[14] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$styles$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].authCard,
            children: [
                t7,
                t8
            ]
        }, void 0, true, {
            fileName: "[project]/features/auth/auth.client.tsx",
            lineNumber: 80,
            columnNumber: 10
        }, this);
        $[13] = t7;
        $[14] = t8;
        $[15] = t9;
    } else {
        t9 = $[15];
    }
    return t9;
}
_s(AuthForm, "juHMKC6x2j1wnRvCiB5VrABnZyE=");
_c = AuthForm;
var _c;
__turbopack_context__.k.register(_c, "AuthForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/auth/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$auth$2e$client$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/features/auth/auth.client.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$authProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/providers/authProvider.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
function RootLayout(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(2);
    if ($[0] !== "a2bbb5bb635d3a6ad10ef0cd35d8219191a6673c5b19e3f4430087e9d3ae9562") {
        for(let $i = 0; $i < 2; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "a2bbb5bb635d3a6ad10ef0cd35d8219191a6673c5b19e3f4430087e9d3ae9562";
    }
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
            lang: "en",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$providers$2f$authProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$features$2f$auth$2f$auth$2e$client$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/app/auth/page.tsx",
                            lineNumber: 16,
                            columnNumber: 52
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/auth/page.tsx",
                        lineNumber: 16,
                        columnNumber: 38
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/auth/page.tsx",
                    lineNumber: 16,
                    columnNumber: 32
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/auth/page.tsx",
                lineNumber: 16,
                columnNumber: 26
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/auth/page.tsx",
            lineNumber: 16,
            columnNumber: 10
        }, this);
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    return t1;
}
_c = RootLayout;
var _c;
__turbopack_context__.k.register(_c, "RootLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_270e9c7f._.js.map