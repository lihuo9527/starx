import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
// @mui
import { useTheme } from '@mui/material/styles';
import {
    Stack, Card, Table, TableRow, Checkbox, TableBody, TableCell,
    Container, Typography, TableContainer, TablePagination, Dialog,
    DialogTitle, DialogContent, DialogContentText, Button, DialogActions,
    InputAdornment, Box, MenuItem, Divider, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
// components
import Iconify from '../../components/Iconify';
import InputStyle from '../../components/InputStyle';
// redux
import { useDispatch } from '../../redux/store';
// utils
import { fDateTime } from '../../utils/formatTime';
// hooks
import useSettings from '../../hooks/useSettings';

// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { ProductListHead } from '../../sections/@dashboard/e-commerce/product-list';
import { setGlobalMessage } from '../../redux/slices/global';
// import AddUserDialog from './components/userEdit';
import * as api from '../../services/api-client';
import Loading from '../../components/loading';

const TABLE_HEAD = [
    { id: 'id', label: 'ID', alignCenter: true },
    { id: 'name', label: '用户名', alignCenter: true },
    { id: 'identificationCode', label: '识别码', alignCenter: true },
    { id: 'memberLeave', label: '用户等级', alignCenter: true },
    { id: 'balance', label: '账号余额', alignCenter: true },
    { id: 'status', label: '账号权限', alignCenter: true },
    { id: 'createTime', label: '注册日期', alignCenter: true },
    { id: '', label: '操作', alignCenter: true },
];

export default function UserInfo() {
    const { themeStretch } = useSettings();
    const theme = useTheme();
    const dispatch = useDispatch();

    const [userList, setUserList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [filterValue, setFilterValue] = useState({
        identificationCode: '',
        name: '',
        status: ''
    });
    const [visible, setVisible] = useState(false);
    const [total, setTotal] = useState(0);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [operationValue, setOperationValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [isBalanceDialogVisible, setIsBalanceDialogVisible] = useState(false);
    const [verifyCodeCount, setVerifyCodeCount] = useState(0);
    const [userForm, setUserForm] = useState({
        id: '',
        identificationCode: '',
        memberLeave: '',
        payPassword: '',
        status: '',
        name: '',
    });
    const [balanceForm, setBalanceForm] = useState({
        "amount": '',
        "chargeType": "增加",
        "describe_": "",
        "payPassword": '',
        "userId": '',
        "valCode": ''
    });
    const [balance, setBalance] = useState('');
    const [isFilterValueChange, setIsFilterValueChange] = useState(false);

    useEffect(() => {
        getList();
    }, [rowsPerPage, isFilterValueChange]);

    const getList = async (pageValue = 1) => {
        setIsLoading(true)
        try {
            const params = {
                ...filterValue,
            };
            const { page } = await api.fetchUserList(params, pageValue, rowsPerPage);
            setTotal(page.totalCount);
            setUserList(page.list);
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false)
    };

    // 搜索条件设置
    const handleFilter = (key, value) => {
        setFilterValue({ ...filterValue, [key]: value });
    };

    // 点击搜索按钮触发事件
    const onSearch = () => {
        setPage(0);
        getList();
    };

    // 点击重置按钮触发事件
    const onReset = () => {
        setFilterValue({ identificationCode: '', name: '', status: '' });
        setPage(0);
        setIsFilterValueChange(!isFilterValueChange);
    };

    // 每页显示条数切换
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const onVerifyCodeSend = async () => {
        let count = 60;
        setVerifyCodeCount(count);
        const timer = setInterval(() => {
            count -= 1;
            setVerifyCodeCount(count);
            if (count === 0) clearInterval(timer);
        }, 1000);
        try {
            console.log(balanceForm);
            const result = await api.sendVerifyCode(balanceForm.userId);
        } catch (e) {
            console.log(e);
        }
    }
    // 打开编辑用户弹窗
    const onEditUser = (row = {}) => {
        setUserForm(row);
        setDialogVisible(true);
    };

    // 关闭编辑用户弹窗
    const onEditDialogClose = () => {
        setUserForm({
            id: '',
            identificationCode: '',
            memberLeave: '',
            payPassword: '',
            status: '',
            name: '',
        })
        setDialogVisible(false);
    }


    // 打开编辑余额弹窗
    const onEditBalance = (row = {}) => {
        setBalance(row.balance);
        setBalanceForm({ ...balanceForm, userId: row.id });
        setIsBalanceDialogVisible(true);
    };

    const onBalanceDialogClose = () => {
        setIsBalanceDialogVisible(false);
    }

    const editUser = async () => {
        if(!userForm.payPassword) {
            dispatch(
                setGlobalMessage({
                    variant: 'error',
                    msg: '管理员密码不能为空！',
                })
            );
            return;
        }
        setIsButtonLoading(true);
        let result = {};
        try {
            result = await api.editUser({ userId: userForm.id, payPassword: userForm.payPassword, status: userForm.status });
            if (result.msg === 'success') {
                getList();
                dispatch(
                    setGlobalMessage({
                        variant: 'success',
                        msg: '编辑成功！',
                    })
                );
                setDialogVisible(false);
                setIsButtonLoading(false);
                return;
            }
        } catch (e) {
            console.log(e);
        }
        dispatch(
            setGlobalMessage({
                variant: 'error',
                msg: result.msg || '编辑失败！',
            })
        );
        setIsButtonLoading(false);
    }

    const balanceUpdate = async () => {
        setIsButtonLoading(true);
        let result = {};
        try {
            result = await api.userDeposit(balanceForm);
            if (result.msg === 'success') {
                getList();
                dispatch(
                    setGlobalMessage({
                        variant: 'success',
                        msg: '变更成功！',
                    })
                );
                setDialogVisible(false);
                setIsButtonLoading(false);
                return;
            }
        } catch (e) {
            console.log(e);
        }
        dispatch(
            setGlobalMessage({
                variant: 'error',
                msg: result.msg || '变更失败！',
            })
        );
        setIsButtonLoading(false);
    }



    return (
        <Page title="用户信息">
            <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: 'relative' }}>
                <HeaderBreadcrumbs
                    heading="用户信息"
                    links={[
                        { name: '用户信息' },
                        { name: '用户资料' },
                    ]}
                />
                <Card>
                    <Stack>
                        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ py: 2.5, px: 3 }}>
                            <InputStyle
                                label='用户名'
                                size='small'
                                stretchStart={240}
                                value={filterValue.name}
                                onChange={(event) => handleFilter('name', event.target.value)}
                                placeholder="请输入用户名"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"/>
                                           
                                    ),
                                }}
                            />
                            <InputStyle
                                size='small'
                                label='识别码'
                                stretchStart={240}
                                value={filterValue.identificationCode}
                                onChange={(event) => handleFilter('identificationCode', event.target.value)}
                                placeholder="请输入识别码"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"/>
                                    ),
                                }}
                            />
                            <InputStyle
                                stretchStart={240}
                                size='small'
                                select
                                label="账号权限"
                                placeholder="请选择权限状态"
                                value={filterValue.status}
                                onChange={(event, ref) => {
                                    setFilterValue({ ...filterValue, status: event.target.value })
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            >
                                <MenuItem value='1'>已开通</MenuItem>
                                <MenuItem value='0'>未开通</MenuItem>
                                {/* <MenuItem value={'UNKNOWN'}>未知</MenuItem> */}
                            </InputStyle>
                            <Button onClick={debounce(onSearch, 300)} sx={{ width: 104, maxHeight: 40 }} variant="outlined">
                                查询
                            </Button>

                            <Button onClick={debounce(onReset, 300)} sx={{ maxHeight: 40 }} variant="outlined">
                                重置
                            </Button>

                        </Stack>
                    </Stack >
                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 800 }}>
                            <Table>
                                <ProductListHead
                                    needCheckBox='false'
                                    headLabel={TABLE_HEAD}
                                    rowCount={userList.length}
                                    numSelected={selected.length}
                                // onSelectAllClick={handleSelectAllClick}
                                />
                                <TableBody sx={{ px: 2 }}>
                                    {userList.map((row) => {
                                        const { id, identificationCode, name, memberLeave, balance, status, createTime } = row;

                                        const isItemSelected = selected.indexOf(id) !== -1;

                                        return (
                                            <TableRow
                                                hover
                                                key={id}
                                                tabIndex={-1}
                                                role="checkbox"
                                                selected={isItemSelected}
                                                aria-checked={isItemSelected}

                                            >

                                                <TableCell align="center" style={{ minWidth: 100 }}>{id}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{name}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{identificationCode}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{memberLeave}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{balance}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 160 }}>
                                                    <Label
                                                        variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                        color={!status ? 'error' : 'success'}
                                                    >
                                                        {!status ? '未开通' : '已开通'}
                                                    </Label>
                                                </TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{fDateTime(createTime)}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 140 }} >
                                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                                                        <Typography onClick={() => onEditUser(row)} color={theme.palette.info.main} variant="body1" style={{ cursor: 'pointer' }}>
                                                            编辑
                                                        </Typography>
                                                        <Typography onClick={() => onEditBalance(row)} color={theme.palette.info.main} variant="body1" style={{ cursor: 'pointer' }}>
                                                            余额
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                {total === 0 && isLoading === false && (
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" colSpan={12}>
                                                <Box sx={{ py: 3 }}>
                                                    暂无数据
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                )}
                            </Table>
                        </TableContainer>
                    </Scrollbar>
                    {total > 0 && <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={total}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, value) => {
                            setPage(value);
                            getList(value + 1);
                        }}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    }

                </Card >
                {/* 用户编辑 */}
                <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'800px'} open={dialogVisible}>
                    <DialogTitle id="scroll-dialog-title">
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                            <Typography variant="h6"> 用户编辑 </Typography>
                            <Iconify onClick={onEditDialogClose} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, width: '720px' }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <InputStyle
                                disabled
                                label="用户名"
                                style={{ width: '50%', marginRight: 10 }}
                                placeholder="请输入用户名"
                                value={userForm.name}
                                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <InputStyle
                                disabled
                                label="识别码"
                                style={{ width: '50%', marginLeft: 10 }}
                                placeholder="请输入识别码"
                                value={userForm.identificationCode}
                                onChange={(e) => setUserForm({ ...userForm, identificationCode: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3, width: '100%' }}
                        >
                            <InputStyle
                                disabled
                                label="会员等级"
                                select
                                style={{ width: '50%', marginRight: 10 }}
                                placeholder="请选择会员等级"
                                value={userForm.memberLeave}
                                onChange={(e) => setUserForm({ ...userForm, memberLeave: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            >
                                <MenuItem value='VIP0'>VIP0</MenuItem>
                                <MenuItem value='VIP1'>VIP1</MenuItem>
                                <MenuItem value='VIP2'>VIP2</MenuItem>
                                <MenuItem value='VIP3'>VIP3</MenuItem>
                                <MenuItem value='VIP4'>VIP4</MenuItem>
                                <MenuItem value='VIP5'>VIP5</MenuItem>
                                <MenuItem value='VIP6'>VIP6</MenuItem>
                                <MenuItem value='VIP7'>VIP7</MenuItem>
                                <MenuItem value='VIP8'>VIP8</MenuItem>
                                <MenuItem value='VIP9'>VIP9</MenuItem>
                            </InputStyle>
                            <InputStyle
                                label="会员状态"
                                select
                                style={{ width: '50%', marginLeft: 10 }}
                                placeholder="请选择状态"
                                value={userForm.status}
                                onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            >
                                <MenuItem value='0'>未开通</MenuItem>
                                <MenuItem value='1'>已开通</MenuItem>

                            </InputStyle>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <InputStyle
                                label="管理员密码"
                                style={{ width: '100%' }}
                                placeholder="请输入管理员密码"
                                value={userForm.payPassword}
                                onChange={(e) => setUserForm({ ...userForm, payPassword: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={onEditDialogClose} variant="outlined">
                            取消
                        </Button>
                        <LoadingButton
                            onClick={editUser}
                            loading={isButtonLoading}
                            variant="contained"

                        >确认</LoadingButton>
                        {/* <Button  >
                            确认
                        </Button> */}
                    </DialogActions>
                </Dialog>

                {/* 余额变更 */}
                <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'800px'} open={isBalanceDialogVisible}>
                    <DialogTitle id="scroll-dialog-title">
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                            <Typography variant="h6"> 余额变更 </Typography>
                            <Iconify onClick={onBalanceDialogClose} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, width: '720px' }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <span style={{ color: '#637381', fontSize: '14px' }}>当前余额：</span><span>{balance}</span>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <span style={{ color: '#637381', fontSize: '14px' }}>余额变更：</span>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                onChange={(e) => setBalanceForm({ ...balanceForm, chargeType: e.target.value })}
                                defaultValue="ADD"
                                value={balanceForm.chargeType}
                                sx={{ marginLeft: '10px' }}
                            >
                                <FormControlLabel value="ADD" control={<Radio />} label="增加" />
                                <FormControlLabel value="DEDUCT" control={<Radio />} label="扣除" />
                            </RadioGroup>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <InputStyle
                                label="金额"
                                style={{ width: '50%', marginRight: 10 }}
                                placeholder="请输入金额"
                                value={balanceForm.amount}
                                onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <InputStyle
                                label="管理员密码"
                                style={{ width: '50%', marginLeft: 10 }}
                                placeholder="请输入管理员密码"
                                value={balanceForm.payPassword}
                                onChange={(e) => setBalanceForm({ ...balanceForm, payPassword: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                        </Stack>

                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <InputStyle
                                label="变更原因"
                                style={{ width: '100%' }}
                                placeholder="请输入变更原因"
                                value={balanceForm.describe_}
                                onChange={(e) => setBalanceForm({ ...balanceForm, describe_: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <InputStyle
                                label="验证码"
                                style={{ width: '80%' }}
                                placeholder="请输入验证码"
                                value={balanceForm.valCode}
                                onChange={(e) => setBalanceForm({ ...balanceForm, valCode: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <Button onClick={onVerifyCodeSend} disabled={verifyCodeCount > 0} variant="outlined" sx={{ marginLeft: '20px', height: '46px', width: '130px' }}>
                                {verifyCodeCount === 0 && <span>发送验证码</span>}

                                {verifyCodeCount > 0 && <span>{verifyCodeCount}秒后再发送</span>

                                }
                            </Button>
                        </Stack>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={onBalanceDialogClose} variant="outlined">
                            取消
                        </Button>
                        <LoadingButton
                            onClick={balanceUpdate}
                            loading={isButtonLoading}
                            variant="contained"

                        >确认</LoadingButton>
                        {/* <Button  >
                            确认
                        </Button> */}
                    </DialogActions>
                </Dialog>
                
            </Container >
            {isLoading && <Loading />}
        </Page >
    );
}
