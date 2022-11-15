import React from "react";
import NavBar from "./NavBar";
import Wrapper, { WrapperVariant } from "./Wrapper";

interface LayoutProps {
	children: any;
	variant?: WrapperVariant;
}

const Layout = ({ children, variant }: LayoutProps) => {
	return (
		<>
			<NavBar />
			<Wrapper variant={variant}>{children}</Wrapper>
		</>
	);
};
export default Layout;
