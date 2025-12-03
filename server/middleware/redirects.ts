export default defineEventHandler((event) => {
    const path = event.path

    if (path.startsWith('/numeros-anteriores') || path.startsWith('/topoi')) {
        return sendRedirect(event, '/edicoes', 301)
    }
})
