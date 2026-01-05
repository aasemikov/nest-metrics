export function generateTestFilename(route: string): string {
    return (
        (route
            .replace(/^\/+/, '')
            .replace(/:/g, '-')
            .replace(/\//g, '-')
            .replace(/[^a-zA-Z0-9\-_]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase() || 'root') + '.test.js'
    );
}
