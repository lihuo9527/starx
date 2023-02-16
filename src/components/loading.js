import { CircularProgress } from '@mui/material';

export default function Loading() {
    return (
        <div style={{ position: 'absolute', left: '0', top: '0', with: '100%', height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0, 0, 0, 0.007)' }}>
            <CircularProgress  />
        </div>
    )
}