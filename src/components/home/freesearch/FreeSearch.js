import { Grid, TextField, Tooltip } from '@mui/material'
import SearchActions from '../searchactions/SearchActions';
import PropTypes from "prop-types";

const propTypes = {
    handleOpenErrorAlert: PropTypes.func,
    handleErrorMessage: PropTypes.func
}

function FreeSearch(props) {
    return (
        <Grid item container xs={12} sx={{ display: 'flex', flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
            <Tooltip arrow title={<div>* for any # character wildcard<br />? for single character wildcard<br />= at beginning for exactly equal</div>}>
                <TextField
                    sx={{ display: "flex", flexGrow: 1, minWidth: { xs: '100%', md: '50%', lg: '16%' }, textOverflow: 'ellipsis' }}
                    id="freeSearch"
                    label="Search Query"
                    name="freeSearch"
                    autoComplete="off"
                    value={null}
                    placeholder="Search Query"
                    type="search"
                    variant="outlined"
                />
            </Tooltip>
            <SearchActions />
        </Grid>
    )
}

FreeSearch.propTypes = propTypes;
export default FreeSearch;
