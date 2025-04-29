import { Toaster } from "sonner"
import Home from "./components/Home"
import { ThemeProvider } from "./components/theme-provider"
import { UrlProvider } from "./contexts/UrlContext"

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <UrlProvider>
          <div className="@container">
            <Toaster/>
            <Home />
          </div>
        </UrlProvider>
      </ThemeProvider>
    </>
  )
}

export default App
