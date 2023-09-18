import { Grid, Box, IconButton, InputAdornment, Popover, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import SearchActions from '../searchactions/SearchActions';
import PropTypes from "prop-types";
import { useRef, useState } from 'react';

const propTypes = {
    freeformQuery: PropTypes.string,
    setFreeformQuery: PropTypes.func,
    handleFreeformChange: PropTypes.func,
    handleClear: PropTypes.func,
    searchProperties: PropTypes.array,
    searchTags: PropTypes.array
}

function FreeSearch(props) {
    const [anchorEl, setAnchorEl] = useState(null);
    const textFieldRef = useRef();

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
        <Grid item container xs={12} sx={{ display: 'flex', flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
            <Tooltip arrow title={<div>Space delimited string<br />PV name (with * and ?)<br />Followed by property=value pairs<br />Followed by tag names</div>}>
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
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={(event) => handleOpenAtts(event, "props")}
                                    disableRipple
                                    sx={{ '&:hover': { backgroundColor: 'white', color: 'black' } }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </InputAdornment>
                        )
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
    )
}

FreeSearch.propTypes = propTypes;
export default FreeSearch;
