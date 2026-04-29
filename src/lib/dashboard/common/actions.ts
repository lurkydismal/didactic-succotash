
export function makeCrudActions<R, RI extends Record<string, unknown>>(
    config: CrudConfig,
) {
    return {
        _getRowsAction: async (): Promise<Readonly<R[]>> => {
            const result = await getRows(config);

            if (result.ok) return result.data as R[];

            const message = `Failed to get rows in action: ${result.error}`;
            log.error(message);
            throw new Error(message);
        },
        createRowAction: async (row: RI): Promise<boolean> => {
            "use server";
            const fd = new FormData();

            for (const [key, value] of Object.entries(row)) {
                if (value !== undefined && value !== null) {
                    fd.set(key, value instanceof Date ? value.toISOString() : String(value));
                }
            }

            const result = await saveFromFormData(config, fd, { isUpdate: false });

            if (!result.ok) {
                const message = `Failed to create row in action: ${result.error}`;
                log.error(message);
                throw new Error(message);
            }

            return true;
        },
        updateRowAction: async (fd: FormData): Promise<boolean> => {
            "use server";

            const result = await saveFromFormData(config, fd, { isUpdate: true });

            if (!result.ok) {
                const message = `Failed to update row in action: ${result.error}`;
                log.error(message);
                throw new Error(message);
            }

            return true;
        },
    };
}
