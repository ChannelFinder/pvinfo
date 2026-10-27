import { Box, Chip, Typography } from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { useMemo } from 'react';
import { parseAdvancedQuery, getPropertyLabels } from './advancedQuery';

// Read only chips showing how the Advanced search query will be searched
function QueryPreview({ query }) {
    const terms = useMemo(() => {
        const labels = getPropertyLabels();
        return Object.entries(parseAdvancedQuery(query)).flatMap(([key, value]) => {
            if (key === "pvName") {
                return { key, label: `PV name: ${value === "*" ? "any" : value}`, color: "primary" };
            }
            if (key === "tag") {
                return value.map((tag, index) => (tag === ""
                    ? { key: `tag${index}`, label: "tag = …", tag: true, color: "warning" }
                    : { key: `tag${index}`, label: tag, tag: true }));
            }
            // a property without a value can't be searched, see getAdvancedQueryError
            return value === ""
                ? { key, label: `${labels[key] || key} = …`, color: "warning" }
                : { key, label: `${labels[key] || key} = ${value}` };
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
