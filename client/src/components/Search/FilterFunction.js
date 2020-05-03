// Create Filters
const CreateFilters = (filters, filters_visible) => {
    // Control section number
    filters = filters.filter(f => 1 < f.labels.length <= 10);
    // Calculate total value
    filters.map((f, i) => {
        // Remove 0 values
        let index = f.values.indexOf(0);
        if (index > -1) {
            f.labels.splice(index, 1);
            f.values.splice(index, 1);
        }
        
        // Total value
        let total_value = f.values.reduce((a, b) => a + b, 0);
        f.total_value = total_value;
        return f
    });
    // Skip 
    filters = filters.filter(f => {
        let ifSave = true;
        if (f.labels.includes("")) {
            f.labels.forEach((l, i) => {
                if (l === "") {
                    if (f.values[i] / f.total_value > 0.98) {
                        ifSave = false
                    } else {
                        f.labels[i] = "No " + f.type
                    }
                }
            })
        }
        return ifSave
    })
    // Slice
    if (filters.length > 10)
        filters.slice(0, 10);
    // Get Visible
    filters.map((f, i) => {
        if (i === 0)
            filters_visible[f.type] = true;
        else
            filters_visible[f.type] = false;
        return f
    });
    return {filters, filters_visible}
}

const FilterFunction = {
    CreateFilters
};

export default FilterFunction;
