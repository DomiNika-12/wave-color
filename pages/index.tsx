import Head from 'next/head'
import Image from 'next/image'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import { TbArrowBigLeft } from 'react-icons/tb';

function calculateGaussian(alpha: number, peak: number, stdDevLeft: number, stdDevRight: number) {
  if (alpha < peak) {
    let r = (Math.exp((-0.5 * Math.pow((alpha - peak), 2)) / Math.pow(stdDevLeft, 2)))
    return r
  }
  // Alpha >= peak
  return (Math.exp((-0.5 * Math.pow((alpha - peak), 2)) / Math.pow(stdDevRight, 2)))
}

function calculateX(alpha: number) {
  let r = (1.056 * calculateGaussian(alpha, 599.8, 37.9, 31) + 0.362 * calculateGaussian(alpha, 442, 16, 26.7) - 0.065 * calculateGaussian(alpha, 501.1, 20.4, 26.2))
  console.log("Alpha" + alpha + " x: " + r)
  return r
}

function calculateY(alpha: number) {
  let r = (0.821 * calculateGaussian(alpha, 568.8, 46.9, 40.5) + 0.286 * calculateGaussian(alpha, 530.9, 16.3, 31.1))
  console.log("Alpha" + alpha + " y: " + r)
  return r
}

function calculateZ(alpha: number) {
  let r = (1.217 * calculateGaussian(alpha, 437, 11.8, 36) + 0.681 * calculateGaussian(alpha, 459, 26, 13.8))
  console.log("Alpha" + alpha + " z: " + r)
  return r
}

function calculateR(alpha: number) {
  let r = (3.2406 * calculateX(alpha) + (-1.5372 * calculateY(alpha)) + (-0.4986 * calculateZ(alpha)))
  let n = normalize(r)
  console.log("Normalized R: " + n + " r: " + r)
  return n
}

function calculateG(alpha: number) {
  let r = (-0.9689 * calculateX(alpha) + 1.8758 * calculateY(alpha) + 0.0415 * calculateZ(alpha))
  let n = normalize(r)
  console.log("Normalized G: " + n + " r: " + r)
  return n
}

function calculateB(alpha: number) {
  let r = (0.0557 * calculateX(alpha) - 0.2040 * calculateY(alpha) + 1.0570 * calculateZ(alpha))
  let n = normalize(r)
  console.log("Normalized B: " + n + " r: " + r)
  return n
}

function normalize(C: number) {
  if (C <= 0.0031308) {
    return 12.92 * C
  }
  return (1.055 * Math.pow(C, 1 / 2.4) - 0.055)
}

interface divData {
  color: string,
  alpha: number
}

export default function Home() {

  const [divArray, setDivArray] = useState<divData[]>([])
  const [arrowPos, setArrowPos] = useState(0)
  const [windowSize, setWindowSize] = useState<Window>()
  const [height, setHeight] = useState(0)

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(window);
    }

    let height = window.innerHeight
    console.log("Window height: " + window.innerHeight)
    let step = (720 - 380) / (height)
    let length = 380
    for (let i = 0; i <= height; i++) {
      if (divArray.length > height) {
        break
      }
      let newColor = `rgb(${(calculateR(length) * 255).toFixed(0)},${(calculateG(length) * 255).toFixed(0)}, ${(calculateB(length) * 255).toFixed(0)})`
      let newArray = divArray
      newArray.push({ color: newColor, alpha: length })
      setDivArray([...newArray])
      length = length + step
    }
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [])

  const [alpha, setAlpha] = useState(0)

  const alphaChangeHandler = (e: any) => {
    let alphaNew: number = 0;
    if (e.target.value === 'NaN') {
      console.log(e.target.value)
      setAlpha(alphaNew)
    }
    else {
      alphaNew = parseFloat(e.target.value)
      setAlpha(alphaNew)
      console.log(`rgb(${calculateR(alphaNew)}, ${calculateG(alphaNew).toFixed(2)}, ${calculateB(alphaNew).toFixed(2)})`)
    }
  }

  useEffect(() => {
    let height = window.innerHeight || 0
    let step = (720 - 380) / (height)
    if (alpha > 720) {
      setArrowPos((720 - 380) / step)
      return
    }
    if (alpha < 380) {
      setArrowPos((380 - 380) / step)
      return
    }
    let numberOfSteps = (alpha - 380) / step
    setArrowPos(numberOfSteps - 20)
  }, [alpha, setAlpha])

  return (

    <div className={styles.container}>
      <div style={{ width: '10%', height: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed' }}>
        {divArray.map((e, i) => {
          return (<div style={{ backgroundColor: e.color, width: '100%', height: `1px` }} key={e.alpha + i}></div>)
        })}
        <div style={{ backgroundColor: 'transparent', color: 'white', position: 'fixed', top: '5px', left: '5px' }}>380 nm</div>
        <div style={{ backgroundColor: 'transparent', color: 'white', position: 'fixed', bottom: '5px', left: '5px' }}>750 nm</div>
      </div>
      <div style={{ marginLeft: '10%', display: 'flex', flexDirection: 'row', width: '100%' }}>
        <div style={{ height: '100vh', backgroundColor: 'white', width: '100px' }}>
          <div style={{
            top: `${arrowPos}px`,
            position: 'sticky',
            color: `rgb(${(calculateR(alpha) * 255).toFixed(0)},${(calculateG(alpha) * 255).toFixed(0)}, ${(calculateB(alpha) * 255).toFixed(0)})`
          }}>
            <TbArrowBigLeft className={styles.pointingArrow} style={{
              color: `rgb(${(calculateR(alpha) * 255).toFixed(0)},${(calculateG(alpha) * 255).toFixed(0)}, ${(calculateB(alpha) * 255).toFixed(0)})`
            }} />
          </div>
        </div>

        <div className={styles.wrapper}>
          <h1 className={styles.title}>Visible Light Spectrum</h1>
          <div style={{
            width: '40%', height: '100px',
            backgroundColor: `rgb(${(calculateR(alpha) * 255).toFixed(0)},${(calculateG(alpha) * 255).toFixed(0)}, ${(calculateB(alpha) * 255).toFixed(0)})`
          }}></div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <input value={alpha} onChange={alphaChangeHandler} type='number' className={styles.input} />
            <div style={{ fontSize: '30px', textAlign: 'center' }}>nm</div>
          </div>
          {/* <img src={'/spectrum.jpg'} width={'500px'} /> */}

        </div>
      </div>
    </div >
  )
}
