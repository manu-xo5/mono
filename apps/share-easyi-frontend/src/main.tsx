import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import {
    getContext,
    Provider as TanstackQueryProvider,
} from "./integrations/tanstack-query/root-provider"

// Import the generated route tree
import { routeTree } from "./routeTree.gen"
import "./styles.css"

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        ...getContext(),
    },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    // eslint-disable-next-line ts/consistent-type-definitions
    interface Register {
        router: typeof router
    }
}

// Render the app
const rootElement = document.getElementById("app")
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <TanstackQueryProvider>
                <RouterProvider router={router} />
            </TanstackQueryProvider>
        </StrictMode>,
    )
};
