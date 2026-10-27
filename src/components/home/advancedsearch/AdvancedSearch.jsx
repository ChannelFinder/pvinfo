import { Grid, Box, Button, IconButton, InputAdornment, List, ListItemButton, ListItemText, Popover, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import SearchActions from '../searchactions/SearchActions';
import { Fragment, useMemo, useRef, useState } from 'react';
import QueryPreview from './QueryPreview';
import { getPropertyLabels } from './advancedQuery';

// upper case before lower case, so friendly labels are listed before raw lower case Channel Finder names
const byLabel = (a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0);

// one column of the properties and tags popover, narrower on phones so both columns fit side by side
function AttributeList({ title, items, onSelect }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: { xs: 140, sm: 200 }, maxWidth: { xs: 160, sm: 320 } }}>
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'grey.300' }}>
                <Typography sx={{ fontWeight: 'medium' }}>{title}</Typography>
            </Box>
            <List dense disablePadding sx={{ overflow: 'auto', maxHeight: 'min(360px, 50vh)' }}>
                {items.map((item) => (
                    <ListItemButton key={item.name} onClick={() => onSelect(item.name)} title={item.label}>
                        <ListItemText primary={item.label} slotProps={{ primary: { noWrap: true } }} />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}

function AdvancedSearch(props) {
    const [anchorEl, setAnchorEl] = useState(null);
    const textFieldRef = useRef();
    const [syntaxTooltipOpen, setSyntaxTooltipOpen] = useState(false);
    // hide the syntax tooltip while hovering the add button so only its own tooltip shows
    const [addHovered, setAddHovered] = useState(false);

    const handleOpenAtts = () => {
        setAnchorEl(textFieldRef.current);
    }

    const handleCloseAtts = () => {
        setAnchorEl(null);
    }

    const handleSelectAtt = (value, isProp) => {
        let prefix = props.advancedQuery.length === 0 ? "* "
            : props.advancedQuery.slice(-1) === " " ? ""
                : " "
        let suffix = isProp ? "=" : "";
        props.setAdvancedQuery(props.advancedQuery + prefix + value + suffix);
    }

    const open = Boolean(anchorEl);
    const id = open ? 'properties-popover' : undefined;

    const propertyItems = useMemo(() => {
        const labels = getPropertyLabels();
        return props.searchProperties.map((name) => ({ name, label: labels[name] || name })).sort(byLabel);
    }, [props.searchProperties]);
    const tagItems = useMemo(() => props.searchTags.map((name) => ({ name, label: name })).sort(byLabel), [props.searchTags]);
    const hasAttributes = propertyItems.length > 0 || tagItems.length > 0;
    const addLabel = tagItems.length === 0 ? "Properties" : propertyItems.length === 0 ? "Tags" : "Props/Tags";
    const addDescription = tagItems.length === 0 ? "a property" : propertyItems.length === 0 ? "a tag" : "a property or tag";
    const browseDescription = tagItems.length === 0 ? "properties" : propertyItems.length === 0 ? "tags" : "properties and tags";

    return (
        <Fragment>
            <Grid
                container
                sx={{ display: 'flex', flexWrap: { xs: 'wrap', lg: 'nowrap' } }}
                size={12}>
                <Tooltip arrow
                    open={syntaxTooltipOpen && !addHovered}
                    onOpen={() => setSyntaxTooltipOpen(true)}
                    onClose={() => setSyntaxTooltipOpen(false)}
                    title={<div>Space delimited string<br />PV name (with * and ?)<br />Followed by property=value pairs<br />Followed by tag names<br />| between patterns for OR{hasAttributes && <Fragment><br />Click + to add {addDescription}</Fragment>}</div>}>
                    <TextField
                        sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '60%', md: '75%' }, textOverflow: 'ellipsis' }}
                        id="advancedSearch"
                        label="Search Query"
                        name="advancedSearch"
                        ref={textFieldRef}
                        autoComplete="off"
                        value={props.advancedQuery}
                        // onChange={handleInputChange}
                        placeholder="Search Query"
                        type="search"
                        variant="outlined"
                        error={Boolean(props.queryError)}
                        helperText={props.queryError || undefined}
                        onChange={props.handleAdvancedChange}
                        slotProps={{
                            input: {
                                endAdornment: hasAttributes ? (
                                    <Tooltip arrow title={`Add ${addDescription} to the query`}>
                                        <InputAdornment position="end"
                                            onMouseEnter={() => setAddHovered(true)}
                                            onMouseLeave={() => setAddHovered(false)}
                                        >
                                            <Button onClick={handleOpenAtts}
                                                color="primary"
                                                size="small"
                                                startIcon={<AddIcon />}
                                                sx={{ display: { xs: 'none', md: 'inline-flex' }, whiteSpace: 'nowrap' }}
                                            >
                                                {addLabel}
                                            </Button>
                                            <IconButton onClick={handleOpenAtts}
                                                color="primary"
                                                aria-label={`Add ${addDescription}`}
                                                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    </Tooltip>
                                ) : null
                            }
                        }}
                    />
                </Tooltip>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleCloseAtts}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        {propertyItems.length > 0 &&
                            <AttributeList title="Properties" items={propertyItems} onSelect={(name) => handleSelectAtt(name, true)} />
                        }
                        {propertyItems.length > 0 && tagItems.length > 0 &&
                            <Box sx={{ borderRight: 1, borderColor: 'grey.300' }} />
                        }
                        {tagItems.length > 0 &&
                            <AttributeList title="Tags" items={tagItems} onSelect={(name) => handleSelectAtt(name, false)} />
                        }
                    </Box>
                </Popover>
                <SearchActions handleClear={props.handleClear} minWidth={{ xs: '40%', md: '25%' }} />
            </Grid>
            <QueryPreview query={props.advancedQuery} />
            {props.showHelp &&
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Search by PV name pattern, optionally followed by <strong>property=value</strong> pairs and <strong>tag</strong> names. {hasAttributes && <Fragment>Use <strong>+</strong> to browse the available {browseDescription}.</Fragment>}
                </Typography>
            }
        </Fragment>
    );
}

export default AdvancedSearch;
