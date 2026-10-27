import { Box, Chip, Typography } from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { useMemo } from 'react';
import { parseAdvancedQuery, getPropertyLabels } from './advancedQuery';
import { getExactMatchProperties } from '../propertyValues';
import api from '../../../api';

// Read only chips showing how the Advanced search query will be searched, with the wildcards that are added
function QueryPreview({ query }) {
    const terms = useMemo(() => {
        const labels = getPropertyLabels();
        const exactMatchProperties = getExactMatchProperties();
        return Object.entries(parseAdvancedQuery(query)).map(([key, value]) => {
            if (key === "pvName") {
                const pattern = api.PV_NAME_QUERY(value).join(" ");
                return { key, label: `PV name: ${pattern === "*" ? "any" : pattern}`, color: "primary" };
            }
            // same check as the Channel Finder query, see advancedParse in api.js
            if (key.includes("tag")) {
                return { key, label: value, tag: true };
            }
            // a property without a value can't be searched, see getAdvancedQueryError
            if (["", "=", "!"].includes(value)) {
                return { key, label: `${labels[key] || key} ${value === "!" ? "≠" : "="} …`, color: "warning" };
            }
            const { operator, pattern } = api.PROPERTY_QUERY(key, value, exactMatchProperties);
            return { key, label: `${labels[key] || key} ${operator === "!=" ? "≠" : "="} ${pattern}` };
        });
    }, [query]);

    if (terms.length === 0) {
        return null;
    }
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>Searching for:</Typography>
            {terms.map((term) => (
                <Chip key={term.key} size="small" variant="outlined" color={term.color || "default"} label={term.label}
                    icon={term.tag ? <LocalOfferOutlinedIcon /> : undefined} />
            ))}
        </Box>
    );
}

export default QueryPreview;
