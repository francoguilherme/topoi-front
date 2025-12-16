export default defineEventHandler((event) => {
    const path = event.path

    if (path.startsWith('/site/')) {
        const newPath = path.replace('/site', '') || '/'
        return sendRedirect(event, newPath, 301)
    }

    if (path.startsWith('/numeros-anteriores') || path.startsWith('/topoi')) {
        return sendRedirect(event, '/edicoes', 301)
    }
})
