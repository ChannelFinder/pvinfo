import { Box, Button, Tooltip } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import PropTypes from "prop-types";


const propTypes = {
    handleClear: PropTypes.func,
    minWidth: PropTypes.object
}

function SearchActions(props) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1, flexWrap: { xs: 'nowrap' }, minWidth: props.minWidth }}>
            <Tooltip arrow title="Search">
                <Button
                    sx={{ display: "flex", flexGrow: 1, minWidth: '50%' }}
                    aria-label="search"
                    variant="contained"
                    color="info"
                    type="submit"
                >
                    <SearchRoundedIcon style={{ color: 'black' }} fontSize='large' />
                </Button>
            </Tooltip>
            <Tooltip arrow title="Clear">
                <Button aria-label="clear"
                    sx={{ display: "flex", flexGrow: 1, minWidth: '50%' }}
                    variant="contained"
                    color="secondary"
                    onClick={props.handleClear}
                >
                    <ClearRoundedIcon style={{ color: 'black' }} fontSize='large' />
                </Button>
            </Tooltip>
        </Box>
    )
}

export default SearchActions;
