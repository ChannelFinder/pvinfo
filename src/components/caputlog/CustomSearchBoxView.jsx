import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Button, Tooltip, TextField } from "@mui/material";

const CustomSearchBoxView = ({ value, onChange, onSubmit }) => (
    <form onSubmit={onSubmit}
        style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            width: "100%"
        }}
    >
        <TextField
            fullWidth
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search by PV Name, User, or Client"
            variant="outlined"
            size="small"
        />
        <Tooltip title="Search">
            <Button
                variant="contained"
                disableElevation
                color="info"
                type="submit"
                sx={{ minWidth: 56, height: 40 }}
            >
                SEARCH <SearchRoundedIcon sx={{ color: "black" }} />
            </Button>
        </Tooltip>
    </form>
);

export default CustomSearchBoxView;
