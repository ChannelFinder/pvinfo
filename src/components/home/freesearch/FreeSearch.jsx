import { Grid, Box, Button, IconButton, InputAdornment, Popover, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import SearchActions from '../searchactions/SearchActions';
import { Fragment, useRef, useState } from 'react';

function FreeSearch(props) {
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
        let prefix = props.freeformQuery.length === 0 ? "* "
            : props.freeformQuery.slice(-1) === " " ? ""
                : " "
        let suffix = isProp ? "=" : "";
        props.setFreeformQuery(props.freeformQuery + prefix + value + suffix);
    }

    const open = Boolean(anchorEl);
    const id = open ? 'properties-popover' : undefined;

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
                    title={<div>Space delimited string<br />PV name (with * and ?)<br />Followed by property=value pairs<br />Followed by tag names<br />| between patterns for OR<br />Click + to add a property or tag</div>}>
                    <TextField
                        sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '60%', md: '75%' }, textOverflow: 'ellipsis' }}
                        id="freeSearch"
                        label="Search Query"
                        name="freeSearch"
                        ref={textFieldRef}
                        autoComplete="off"
                        value={props.freeformQuery}
                        // onChange={handleInputChange}
                        placeholder="Search Query"
                        type="search"
                        variant="outlined"
                        onChange={props.handleFreeformChange}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <Tooltip arrow title="Add a property or tag to the query">
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
                                                Props/Tags
                                            </Button>
                                            <IconButton onClick={handleOpenAtts}
                                                color="primary"
                                                aria-label="Add property or tag"
                                                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    </Tooltip>
                                )
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'grey.300' }}>
                            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'grey.300' }}>
                                <Typography sx={{ fontWeight: 'medium' }}>Properties</Typography>
                            </Box>
                            <Box sx={{ overflow: 'auto', maxHeight: 200, display: 'flex', flexDirection: 'column' }}>
                                {props.searchProperties.map((property, index) => (
                                    <Typography key={index} onClick={() => handleSelectAtt(property, true)} sx={{ p: 1, '&:hover': { backgroundColor: 'grey.200', cursor: 'default' } }}>{property}</Typography>
                                ))}
                            </Box>
                        </Box>
                        <Box sx={{ minWidth: 80, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'grey.300' }}>
                                <Typography sx={{ fontWeight: 'medium' }}>Tags</Typography>
                            </Box>
                            <Box sx={{ overflow: 'auto', maxHeight: 200, display: 'flex', flexDirection: 'column' }}>
                                {props.searchTags.map((tag, index) => (
                                    <Typography key={index} onClick={() => handleSelectAtt(tag, false)} sx={{ p: 1, '&:hover': { backgroundColor: 'grey.200', cursor: 'default' } }}>{tag}</Typography>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Popover>
                <SearchActions handleClear={props.handleClear} minWidth={{ xs: '40%', md: '25%' }} />
            </Grid>
            {props.showHelp &&
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Search by PV name pattern, optionally followed by <strong>property=value</strong> pairs and <strong>tag</strong> names. Use <strong>+</strong> to browse the available properties and tags.
                </Typography>
            }
        </Fragment>
    );
}

export default FreeSearch;
