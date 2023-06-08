import { Grid, TextField, Tooltip } from '@mui/material'
import SearchActions from '../searchactions/SearchActions';
import PropTypes from "prop-types";

const propTypes = {
    freeformQuery: PropTypes.string,
    handleFreeformChange: PropTypes.func,
    handleClear: PropTypes.func
}

function FreeSearch(props) {
    return (
        <Grid item container xs={12} sx={{ display: 'flex', flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
            <Tooltip arrow title={<div>Space delimited string<br />PV name (with * and ?)<br />Followed by property=value pairs</div>}>
                <TextField
                    sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '60%', md: '75%' }, textOverflow: 'ellipsis' }}
                    id="freeSearch"
                    label="Search Query"
                    name="freeSearch"
                    autoComplete="off"
                    value={props.freeformQuery}
                    placeholder="Search Query"
                    type="search"
                    variant="outlined"
                    onChange={props.handleFreeformChange}
                />
            </Tooltip>
            <SearchActions handleClear={props.handleClear} minWidth={{ xs: '40%', md: '25%' }} />
        </Grid>
    )
}

FreeSearch.propTypes = propTypes;
export default FreeSearch;
