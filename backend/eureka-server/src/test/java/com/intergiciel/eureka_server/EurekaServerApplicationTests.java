package com.intergiciel.eureka_server;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.cloud.discovery.enabled=false",
		"eureka.client.enabled=false",
		"eureka.server.enabled=false"
})
class EurekaServerApplicationTests {

	@Test
	void contextLoads() {
	}

}
