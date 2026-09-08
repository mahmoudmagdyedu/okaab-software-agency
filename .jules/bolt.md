## 2024-03-24 - Missing context memoization
**Learning:** React Context Providers in this codebase (like `ThemeProvider`) are passing object literals directly in the `value` prop: `<ThemeContext.Provider value={{ theme, toggleTheme }}>`. This creates a new object reference on every render of the Provider, forcing re-renders on all consuming components even if `theme` hasn't changed.
**Action:** Always wrap context values in `useMemo` when passing objects, e.g., `const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);`.
