import {useEffect, useState} from 'react';
import {Alert, Box, Card, CardContent, Chip, Stack, Typography} from '@mui/material';
import {adminConstructionService, type AdminConstructionChangeOrders} from '../../services/adminConstruction.service';

const cents = (value: string) => {const [whole, fraction = ''] = value.replace(/^-/, '').split('.'); return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));};
const amount = (value: string) => {const total = cents(value); const negative = value.startsWith('-'); const whole = String(total / 100n); const prefix = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ','); const last = whole.slice(-3); return `${negative ? '−' : ''}₹${prefix ? `${prefix},` : ''}${last}.${String(total % 100n).padStart(2, '0')}`;};
const money = (value?: string | null) => value == null ? 'Pending' : `${!value.startsWith('-') && cents(value) > 0n ? '+' : ''}${amount(value)}`;
const days = (value?: number | null) => value == null ? 'Pending' : value === 0 ? 'No timeline change' : `${value > 0 ? '+' : ''}${value} days`;

export function ConstructionChangeOrdersAdminPanel({projectId}: {projectId: string}) {
  const [data, setData] = useState<AdminConstructionChangeOrders>(); const [error, setError] = useState('');
  useEffect(() => {adminConstructionService.getProjectChangeOrders(projectId).then(setData).catch(reason => setError(reason.message));}, [projectId]);
  return <Box mt={3}><Typography variant="h5" fontWeight={900} mb={1.5}>Change Orders</Typography>{error ? <Alert severity="error">{error}</Alert> : null}{data ? <>
    <Card variant="outlined" sx={{mb: 1.5}}><CardContent><Stack spacing={.5}><Typography>Original contract: {amount(data.originalContractAmount)}</Typography><Typography>Accepted changes: {money(data.acceptedChangeOrdersTotal)}</Typography><Typography fontWeight={900}>Current revised contract: {amount(data.currentRevisedContractAmount)}</Typography><Typography>Accepted timeline changes: {days(data.acceptedDaysDelta)}</Typography></Stack></CardContent></Card>
    {data.items.length ? data.items.map(item => <Card key={item.id} variant="outlined" sx={{mb: 1}}><CardContent><Stack spacing={.5}><Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={900}>Change Order #{item.sequenceNumber}: {item.title}</Typography><Chip size="small" label={item.status.replace(/_/g, ' ')}/></Stack><Typography variant="body2">Initiated by {item.initiatedBy.toLowerCase()} · Created {new Date(item.createdAt).toLocaleString('en-IN')}</Typography><Typography variant="body2">{item.description}</Typography><Typography variant="body2">Reason: {item.reason}</Typography><Typography variant="body2">Amount: {money(item.finalAmountDelta ?? item.proposedAmountDelta)} · Timeline: {days(item.finalDaysDelta ?? item.proposedDaysDelta)}</Typography>{item.proposedAt ? <Typography variant="caption">Proposed {new Date(item.proposedAt).toLocaleString('en-IN')}</Typography> : null}{item.customerDecisionAt ? <Typography variant="caption">Customer decision {new Date(item.customerDecisionAt).toLocaleString('en-IN')}</Typography> : null}</Stack></CardContent></Card>) : <Card variant="outlined"><CardContent><Typography>No Change Orders have been created.</Typography></CardContent></Card>}
  </> : null}</Box>;
}
