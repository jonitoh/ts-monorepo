/* eslint-disable @typescript-eslint/no-misused-promises */
import Card from "#/components/card/card";
import { getSharedValue } from "#/services/api";
import { toUpperCase } from "@jonitoh-ts-monorepo/common";
import React, { useState } from "react";
import styles from "./app.module.scss";

export default function App() {
	const [word] = useState("ZE BIG TEST");
	const [leftResult, setLeftResult] = useState("???");
	const [rightResult, setRightResult] = useState("???");

	async function onClick() {
		setLeftResult(await getSharedValue(word));
		setRightResult(toUpperCase(word));
		// setRightResult(word);
	}
	// onclick ça appelle lapi et ça donne le resultat
	return (
		<div className={styles.app}>
			<div className={styles.wrapper}>
				<Card text={`App to fake encode ${word}`} label="encode!" onClick={onClick} />
				<div className={styles.result}>
					<div className={styles.left}>{leftResult}</div>
					<div className={styles.right}>{rightResult}</div>
				</div>
			</div>
		</div>
	);
}
