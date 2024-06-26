import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Group, rem, useMantineTheme, Burger, Drawer, ScrollArea, Center, Box, UnstyledButton, Collapse, Divider, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconChevronDown,
    IconLogout, IconKey,
    IconSettings, IconUser, IconTrash,
} from '@tabler/icons-react';
import classes from '../styles/navbar.module.css';
import { useAuth } from '../context/authContext.tsx'; // Import useAuth from the provider
import axios from 'axios';

export function Navbar() {
    const [drawerOpened, {toggle: toggleDrawer, close: closeDrawer}] = useDisclosure(false);
    const [menuOpened, setMenuOpened] = useState(false);
    const theme = useMantineTheme();
    const {isAuthenticated, logout} = useAuth(); // Destructure isAuthenticated and logout from context
    const [, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");

        if (confirmDelete) {
            try {
                await axios.delete('http://localhost:4000/v2/users/', {
                    withCredentials: true,
                });
                logout();
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        }
    };

    return (
        <Box pb={60}> {/* Adjusted padding-bottom */}
            <header className={classes.header}>
                <Group justify="space-between" h="100%">
                    <Group h="100%" gap={0} visibleFrom="sm">
                        <Link to="/" className={classes.link}>
                            Home
                        </Link>
                        {isAuthenticated && (<>
                                <Link to="/posts" className={classes.link}>
                                    My Posts
                                </Link>
                                <Link to="/hr/users" className={classes.link}>
                                    Hr Page
                                </Link>
                        </>


                        )}
                    </Group>
                    <Group visibleFrom="sm" className={classes.m_4081bf90}>
                        {!isAuthenticated ? (
                            <Group>
                                <Link to="/login">
                                    <Button variant="default">Log in</Button>
                                </Link>
                                <Link to="/register">
                                    <Button>Sign up</Button>
                                </Link>
                            </Group>
                        ) : (
                            <>
                                <Link to="/create-post" >
                                    <Button color="blue">Create post</Button>
                                </Link>
                                <Menu
                                    width={260}
                                    position="bottom-end"
                                    transitionProps={{transition: 'pop-top-right'}}
                                    onClose={() => setMenuOpened(false)}
                                    onOpen={() => setMenuOpened(true)}
                                    withinPortal
                                    opened={menuOpened} // Add opened prop here
                                >
                                    <Menu.Target>
                                        <UnstyledButton className={classes.link}>
                                            Menu <IconChevronDown style={{width: rem(12), height: rem(12)}}
                                                                  stroke={1.5}/>
                                        </UnstyledButton>
                                    </Menu.Target>
                                    <Menu.Dropdown className={classes.menuDropdown}>
                                        <Link to="/profile/my" className={classes.dropdownSubLink}>
                                            <Menu.Item
                                                leftSection={
                                                    <IconUser style={{width: rem(16), height: rem(16)}} stroke={1.5}/>
                                                }
                                            >
                                                My Profile
                                            </Menu.Item>
                                        </Link>
                                        <Link to="/profile/settings">
                                            <Menu.Item
                                                leftSection={
                                                    <IconSettings style={{width: rem(16), height: rem(16)}}
                                                                  stroke={1.5}/>
                                                }
                                            >
                                                Manage Profile
                                            </Menu.Item>
                                        </Link>
                                        <Link to="/profile/change-password">
                                            <Menu.Item
                                                leftSection={
                                                    <IconKey style={{width: rem(16), height: rem(16)}}
                                                             stroke={1.5}/>
                                                }
                                            >
                                                Change Password
                                            </Menu.Item>
                                        </Link>

                                        <Menu.Item
                                            leftSection={
                                                <IconLogout style={{width: rem(16), height: rem(16)}} stroke={1.5}/>
                                            }
                                            onClick={logout}
                                        >
                                            Logout
                                        </Menu.Item>

                                        <Menu.Divider />

                                        <Menu.Item
                                            leftSection={
                                                <IconTrash style={{width: rem(16), height: rem(16)}} stroke={1.5}/>
                                            }
                                            color="red" // Add red color here
                                            onClick={handleDeleteAccount} // Add delete account handler
                                        >
                                            Delete Account
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </>
                        )}
                    </Group>
                    <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm"/>
                </Group>
            </header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title="Navigation"
                hiddenFrom="sm"
                zIndex={1000000}
                className={classes.drawer}
            >
                <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
                    <Divider my="sm"/>
                    <Link to="/" className={classes.link}>
                        Home
                    </Link>
                    <UnstyledButton className={classes.link} onClick={() => setMenuOpened(!menuOpened)}>
                        <Center inline>
                            <Box component="span" mr={5}>
                                Features
                            </Box>
                            <IconChevronDown style={{width: rem(16), height: rem(16)}} color={theme.colors.blue[6]}/>
                        </Center>
                    </UnstyledButton>
                    <Collapse in={menuOpened}>
                        {isAuthenticated && (
                            <>
                                <Link to="/posts" className={classes.link}>My Posts</Link>
                                <Link to="/profile/my" className={classes.link}>My Profile</Link>
                            </>
                        )}
                    </Collapse>
                    <Divider my="sm"/>
                    <Group justify="center" grow pb="xl" px="md">
                        {!isAuthenticated && (
                            <>
                                <Link to="/login"><Button variant="default">Log in</Button></Link>
                                <Link to="/register"><Button>Sign up</Button></Link>
                            </>
                        )}
                    </Group>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}
